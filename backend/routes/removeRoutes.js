const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Database connection
const authMiddleware = require('../middleware/authMiddleware'); // Authentication middleware

// Route to fetch all Excel sheets
router.get('/get-excel-sheets', authMiddleware, async (req, res) => {
  try {
    const pool = await db;
    console.log("DB Connection Established");

    // Fetching data from the ExcelSheets table
    const result = await pool.request().query(`
      SELECT ExcelSheetID, ExcelSheetName, RecordsCount, FileName
      FROM ExcelSheets
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No Excel sheets found in the database' });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching Excel Sheets:', error);
    res.status(500).json({ message: 'Internal server error while fetching Excel sheets', error: error.message });
  }
});

// Route to remove an Excel sheet
router.post('/', authMiddleware, async (req, res) => {
  const { ExcelSheetID } = req.body;
  let transaction;

  try {
    console.log("Received request to remove Excel sheet with ID:", ExcelSheetID);

    const pool = await db;
    transaction = pool.transaction();
    await transaction.begin();

    // Verifying that the ExcelSheetID exists in ExcelSheets
    const verifyResult = await transaction.request()
      .input('ExcelSheetID', ExcelSheetID)
      .query('SELECT ExcelSheetName, RecordsCount FROM ExcelSheets WHERE ExcelSheetID = @ExcelSheetID');

    if (verifyResult.recordset.length === 0) {
      throw new Error('Excel Sheet not found');
    }

    const ExcelSheetName = verifyResult.recordset[0].ExcelSheetName;
    const RecordsCount = verifyResult.recordset[0].RecordsCount;

    // Combine ExcelSheetName and RecordsCount
    const ExcelSheetNameWithRecords = `${ExcelSheetName} (${RecordsCount})`;

    // Delete associated records from the SlaesRecords table (corrected table name)
    const deleteSalesRecords = await transaction.request()
      .input('ExcelSheetID', ExcelSheetID)
      .query('DELETE FROM SlaesRecords WHERE ExcelSheetID = @ExcelSheetID');

    if (deleteSalesRecords.rowsAffected === 0) {
      console.warn('No Sales Records found for this Excel Sheet');
    }

    // Delete the Excel Sheet from the ExcelSheets table
    await transaction.request()
      .input('ExcelSheetID', ExcelSheetID)
      .query('DELETE FROM ExcelSheets WHERE ExcelSheetID = @ExcelSheetID');


    // Log the action in ExcelSheets_ChangedHistory table
await transaction.request()
.input('ExcelSheetName', ExcelSheetNameWithRecords)
.input('ActionName', 'ExcelSheet Removed')
.input('ChangedBy', req.user.username) // Assuming req.user.username is set after authentication
.query(`
  INSERT INTO ExcelSheets_ChangedHistory (ExcelSheetName, ActionName, ChangedBy, ChangedOn)
  VALUES (@ExcelSheetName, @ActionName, @ChangedBy, GETDATE())
`);

    await transaction.commit();
    res.send({ message: 'Excel Sheet removed successfully' });
  } catch (error) {
    console.error('Error removing Excel Sheet:', error);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).send({ error: error.message || 'Internal server error while removing Excel sheet' });
  }
});

module.exports = router;






//////////////////////////////////////////////////////





