const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const poolPromise = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');
const generateReport = require("../controllers/generateReport");


// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Function to convert Excel serial date to JavaScript Date
const excelDateToJSDate = (serial) => {
  const excelEpoch = new Date(1899, 11, 30); // Excel's epoch starts from 1899-12-30
  const days = Math.floor(serial); // Get the whole number part (days)
  const milliseconds = (serial - days) * 24 * 60 * 60 * 1000; // Convert fractional part to milliseconds
  return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000 + milliseconds);
};

// Route to fetch distributors
router.get('/distributors', authMiddleware, async (req, res) => {
  try {
    console.log("Fetching distributors...");
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DistributorID AS id, DistributorName AS name
      FROM Axianta_Distributors
    `);
    console.log("Distributors fetched:", result.recordset);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Error fetching distributors' });
  }
});

// Route to fetch agencies
router.get('/agencies', authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT AgencyID AS id, AgencyName AS name
      FROM Axianta_Agencies
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ message: 'Error fetching agencies' });
  }
});

// Route to fetch products
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT ProductID AS id, ProductName AS name
      FROM Axianta_Products
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});


router.post('/generate-report', authMiddleware, async (req, res) => {
  try {
    const { distributor, agency, product, fromDate, toDate } = req.body;
    const pool = await poolPromise;

    // Fetch months from the database
    const monthsResult = await pool.request().query(
      `SELECT [MonthID], [MonthName] FROM [Months] ORDER BY [MonthID]`
    );
    const months = monthsResult.recordset;

    // Parse the products from comma-separated string
    const products = product ? product.split(',').map(p => p.trim()).filter(p => p) : [];

    // Build the query for sales data
    let query = `
      SELECT
        Distributor, Agency, Product, YEAR(Date) AS Year, MONTH(Date) AS Month,
        SUM(NetValue) AS NetValue
      FROM SlaesRecords
      WHERE 1=1
    `;

    // Add filters
    if (distributor) {
      query += " AND Distributor IN (SELECT value FROM STRING_SPLIT(@Distributor, ','))";
    }
    if (agency) {
      query += " AND Agency IN (SELECT value FROM STRING_SPLIT(@Agency, ','))";
    }
    if (products.length > 0) {
      query += " AND Product IN (SELECT value FROM STRING_SPLIT(@Product, ','))";
    }
    if (fromDate) {
      query += " AND Date >= @FromDate";
    }
    if (toDate) {
      query += " AND Date <= @ToDate";
    }

    // Group by and order by
    query += `
      GROUP BY Distributor, Agency, Product, YEAR(Date), MONTH(Date)
      ORDER BY Distributor, Agency, Product, YEAR(Date), MONTH(Date)
    `;

    // Create request with parameters
    const request = pool.request();
    if (distributor) request.input('Distributor', distributor);
    if (agency) request.input('Agency', agency);
    if (products.length > 0) request.input('Product', product);
    if (fromDate) request.input('FromDate', fromDate);
    if (toDate) request.input('ToDate', toDate);

    // Execute query
    const result = await request.query(query);
    const records = result.recordset;

    // Generate date range for all months between fromDate and toDate
    let allMonths = [];
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        allMonths.push(`${year}-${month}`);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Transform data for PDF generation
    const transformedData = [];
    records.forEach(record => {
      const monthKey = `${record.Year}-${record.Month}`;
      let entry = transformedData.find(item =>
        item.distributor === record.Distributor &&
        item.agency === record.Agency &&
        item.product === record.Product
      );

      if (!entry) {
        entry = {
          distributor: record.Distributor,
          agency: record.Agency,
          product: record.Product,
          monthlyData: {},
          totalAmount: 0
        };
        transformedData.push(entry);
      }

      entry.monthlyData[monthKey] = record.NetValue;
      entry.totalAmount += record.NetValue;
    });

    // Ensure all months are represented in each entry
    allMonths.forEach(monthKey => {
      transformedData.forEach(entry => {
        if (!entry.monthlyData[monthKey]) {
          entry.monthlyData[monthKey] = 0;
        }
      });
    });

    // Define the filters object
    const filters = {
      distributor: distributor || "",
      agency: agency || "",
      product: product || "",
      fromDate: fromDate || "",
      toDate: toDate || ""
    };

    // Create unique filename
    const outputPath = path.join(__dirname, `../reports/Distributor_Agency_Product_Report_${Date.now()}.pdf`);

    if (transformedData.length === 0) {
      return res.status(404).json({ message: "No data found for the given filters" });
    }

    // Generate the PDF report
    await generateReport(transformedData, filters, outputPath, months);

    // Send the generated PDF file as a response
    res.download(outputPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ message: "Error generating report" });
      }
      // Delete the file after sending
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
});






// Route to fetch the next ExcelSheetID
router.get('/next-excel-sheet-id', authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT ISNULL(MAX(ExcelSheetID), 0) + 1 AS NextExcelSheetID FROM ExcelSheets');
    const nextExcelSheetID = result.recordset[0].NextExcelSheetID;
    res.json({ nextExcelSheetID });
  } catch (error) {
    console.error('Error fetching next ExcelSheetID:', error);
    res.status(500).json({ message: 'Error fetching next ExcelSheetID' });
  }
});

// Route to upload file and process Excel data
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { dataSheetID, excelSheetName } = req.body;

    // Validate required fields
    if (!dataSheetID || !excelSheetName) {
      return res.status(400).json({ message: 'ExcelSheetID and ExcelSheetName are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const pool = await poolPromise;

    // Insert Excel sheet details into the ExcelSheets table
    const result = await pool.request()
  .input('ExcelSheetName', excelSheetName)
  .input('RecordsCount', 0) // Default to 0, will update after processing
  .input('FileName', req.file.originalname)
  .query(`
    INSERT INTO ExcelSheets (ExcelSheetName, RecordsCount, FileName)
    VALUES (@ExcelSheetName, @RecordsCount, @FileName);
    SELECT SCOPE_IDENTITY() AS ExcelSheetID;
  `);

const generatedExcelSheetID = result.recordset[0].ExcelSheetID; // Fetch the auto-generated ID


    // Read the Excel file
    let data;
    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(sheet);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      return res.status(400).json({ message: 'Invalid Excel file format' });
    }


    // Ensure required columns are present
    const requiredColumns = [
      'Date', 'SBU', 'Txn ID', 'Distributor', 'Sales Rep', 'Type Txn', 'Type',
      'Customer Id', 'Customer', 'Outlet Type', 'Agency', 'Brand', 'Product ID',
      'Product', 'BusinessArea', 'Cs', 'Ps', 'Qty Conv', 'Unit Price', 'GrossValue',
      'Line Discount', 'Doc Discount', 'Net Value', 'Return Reason', 'Free Quantity',
      'Town', 'Area'
    ];

    const missingColumns = requiredColumns.filter(col => !data[0]?.hasOwnProperty(col));
    if (missingColumns.length > 0) {
      return res.status(400).json({ message: `Excel file is missing required columns: ${missingColumns.join(', ')}` });
    }

    // Process and insert each row into the database
    for (const [index, row] of data.entries()) {
      try {
        // Validate and parse the Date column
        let dateValue = null;
        if (row['Date']) {
          if (typeof row['Date'] === 'number') {
            dateValue = excelDateToJSDate(row['Date']); // Convert Excel serial number to JS Date
          } else {
            dateValue = new Date(row['Date']); // Parse as a regular date string
          }
        }

        if (dateValue && isNaN(dateValue.getTime())) {
          console.warn(`Skipping row ${index + 1} due to invalid Date: ${row['Date']}`);
          continue; // Skip this row
        }

        // Lookup IDs from the corresponding tables
        const customerResult = await pool.request()
          .input('CustomerName', row['Customer'])
          .query('SELECT CustomerID FROM Axianta_Customers WHERE CustomerName = @CustomerName');
        const customerID = customerResult.recordset.length > 0 ? customerResult.recordset[0].CustomerID : null;

        const distributorResult = await pool.request()
          .input('DistributorName', row['Distributor'])
          .query('SELECT DistributorID FROM Axianta_Distributors WHERE DistributorName = @DistributorName');
        const distributorID = distributorResult.recordset.length > 0 ? distributorResult.recordset[0].DistributorID : null;

        const townResult = await pool.request()
          .input('TownName', row['Town'])
          .query('SELECT TownID FROM Axianta_Towns WHERE TownName = @TownName');
        const townID = townResult.recordset.length > 0 ? townResult.recordset[0].TownID : null;

        const productResult = await pool.request()
          .input('ProductName', row['Product'])
          .query('SELECT ProductID FROM Axianta_Products WHERE ProductName = @ProductName');
        const productID = productResult.recordset.length > 0 ? productResult.recordset[0].ProductID : null;

        const agencyResult = await pool.request()
          .input('AgencyName', row['Agency'])
          .query('SELECT AgencyID FROM Axianta_Agencies WHERE AgencyName = @AgencyName');
        const agencyID = agencyResult.recordset.length > 0 ? agencyResult.recordset[0].AgencyID : null;

        const salesRepResult = await pool.request()
          .input('SalesRepName', row['Sales Rep'])
          .query('SELECT SalesRepID FROM Axianta_SalesReps WHERE SalesRepName = @SalesRepName');
        const salesRepID = salesRepResult.recordset.length > 0 ? salesRepResult.recordset[0].SalesRepID : null;

        // Insert the record into the SlaesRecords table
        await pool.request()
          .input('ExcelSheetID', generatedExcelSheetID)
          .input('Date', dateValue) // Use the validated date
          .input('SBU', row['SBU'] || null) // Handle null values
          .input('TxnID', row['Txn ID'] || null)
          .input('Distributor', row['Distributor'] || null)
          .input('SalesRep', row['Sales Rep'] || null)
          .input('TypeTxn', row['Type Txn'] || null)
          .input('Type', row['Type'] || null)
          .input('CustomerId', row['Customer Id'] || null)
          .input('Customer', row['Customer'] || null)
          .input('OutletType', row['Outlet Type'] || null)
          .input('Agency', row['Agency'] || null)
          .input('Brand', row['Brand'] || null)
          .input('ProductID', row['Product ID'] || null)
          .input('Product', row['Product'] || null)
          .input('BusinessArea', row['BusinessArea'] || null)
          .input('Cs', row['Cs'] || null)
          .input('Ps', row['Ps'] || null)
          .input('QtyConv', row['Qty Conv'] || null)
          .input('UnitPrice', row['Unit Price'] || null)
          .input('GrossValue', row['GrossValue'] || null)
          .input('LineDiscount', row['Line Discount'] || null)
          .input('DocDiscount', row['Doc Discount'] || null)
          .input('NetValue', row['Net Value'] || null)
          .input('ReturnReason', row['Return Reason'] || null)
          .input('FreeQuantity', row['Free Quantity'] || null)
          .input('Town', row['Town'] || null)
          .input('Area', row['Area'] || null)
          .input('ID_Customer', customerID)
          .input('ID_Distributor', distributorID)
          .input('ID_Town', townID)
          .input('ID_Product', productID)
          .input('ID_Agency', agencyID)
          .input('ID_SalesRep', salesRepID)
          .query(`
            INSERT INTO SlaesRecords (
              ExcelSheetID, Date, SBU, TxnID, Distributor, SalesRep, TypeTxn, Type,
              CustomerId, Customer, OutletType, Agency, Brand, ProductID, Product,
              BusinessArea, Cs, Ps, QtyConv, UnitPrice, GrossValue, LineDiscount,
              DocDiscount, NetValue, ReturnReason, FreeQuantity, Town, Area,
              ID_Customer, ID_Distributor, ID_Town, ID_Product, ID_Agency, ID_SalesRep
            ) VALUES (
              @ExcelSheetID, @Date, @SBU, @TxnID, @Distributor, @SalesRep, @TypeTxn, @Type,
              @CustomerId, @Customer, @OutletType, @Agency, @Brand, @ProductID, @Product,
              @BusinessArea, @Cs, @Ps, @QtyConv, @UnitPrice, @GrossValue, @LineDiscount,
              @DocDiscount, @NetValue, @ReturnReason, @FreeQuantity, @Town, @Area,
              @ID_Customer, @ID_Distributor, @ID_Town, @ID_Product, @ID_Agency, @ID_SalesRep
            )
          `);
      } catch (insertError) {
        console.error(`Error inserting record into database for row ${index + 1}:`, insertError);
      }
    }

    // Update the RecordsCount in the ExcelSheets table
    await pool.request()
      .input('ExcelSheetID', generatedExcelSheetID)
      .input('RecordsCount', data.length)
      .query(`
        UPDATE ExcelSheets
        SET RecordsCount = @RecordsCount
        WHERE ExcelSheetID = @ExcelSheetID
      `);

      // Combine ExcelSheetName and RecordsCount
    const ExcelSheetNameWithRecords = `${excelSheetName} (${data.length})`;

      // Log the action in ExcelSheets_ChangedHistory table
    await pool.request()
    .input('ExcelSheetName', ExcelSheetNameWithRecords)
    .input('ActionName', 'ExcelSheet Uploaded')
    .input('ChangedBy', req.user.username) // Assuming authMiddleware adds `username` to `req.user`
    .query(`
      INSERT INTO ExcelSheets_ChangedHistory (ExcelSheetName, ActionName, ChangedBy, ChangedOn)
      VALUES (@ExcelSheetName, @ActionName, @ChangedBy, GETDATE())
    `);

    fs.unlinkSync(req.file.path);


    // Send success response
  res.status(200).json({ message: 'File uploaded and processed successfully' });
} catch (error) {
console.error('Error processing file upload:', error);
res.status(500).json({ message: 'Error processing file: ' + error.message });
}
});

module.exports = router;




///////////////////////////////////////////////////////////////////////////////////////

