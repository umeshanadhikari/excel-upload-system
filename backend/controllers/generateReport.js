const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateReport = (data, filters, outputPath, months) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Helper functions
    const calculateTextWidth = (text, fontSize) => {
      doc.fontSize(fontSize);
      return doc.widthOfString(text);
    };

    const calculateTextHeight = (text, width, fontSize) => {
      doc.fontSize(fontSize);
      const lineHeight = fontSize * 1.2;
      const lines = doc.heightOfString(text, { width });
      return Math.ceil(lines / lineHeight) * lineHeight;
    };

    // Report Title
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Distributor / Agency / Product Report", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`(${filters.fromDate}) - (${filters.toDate})`, { align: "center" })
      .moveDown(1.5);

    // Report Summary
    doc.fontSize(14).font("Helvetica-Bold").text("Report Summary", { underline: true });

    // Get all unique month keys from the data
    const allMonthKeys = new Set();
    data.forEach(row => {
      Object.keys(row.monthlyData || {}).forEach(key => {
        allMonthKeys.add(key);
      });
    });

    const sortedMonthKeys = Array.from(allMonthKeys).sort();

    // Create months mapping
    const monthsMap = months.reduce((acc, month) => {
      acc[month.MonthID] = month.MonthName;
      return acc;
    }, {});

    const monthNames = sortedMonthKeys.map((key) => {
      const [year, month] = key.split("-");
      return `${year}/${monthsMap[month] || month}`;
    });

    // First Table - Summary by Distributor/Agency
    const summaryHeaders = ["Report Summary", ...monthNames, "Total Amount"];
    
    // Calculate column widths for summary table
    const summaryColumnWidths = summaryHeaders.map((header, i) => {
      if (i === 0) return 150; // Fixed width for first column
      const maxWidth = Math.max(
        calculateTextWidth(header, 10),
        ...data.map(row => {
          const value = i < summaryHeaders.length - 1 
            ? (row.monthlyData[sortedMonthKeys[i-1]] || 0).toFixed(2)
            : row.totalAmount.toFixed(2);
          return calculateTextWidth(value, 10);
        })
      );
      return Math.min(maxWidth + 20, 100); // Limit column width
    });

    // Group data by distributor/agency
    const groupedData = {};
    data.forEach(row => {
      const key = `${row.distributor} || ${row.agency}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          distributor: row.distributor,
          agency: row.agency,
          monthlyData: {},
          totalAmount: 0
        };
      }

      Object.keys(row.monthlyData || {}).forEach(monthKey => {
        groupedData[key].monthlyData[monthKey] = (groupedData[key].monthlyData[monthKey] || 0) + row.monthlyData[monthKey];
        groupedData[key].totalAmount += row.monthlyData[monthKey];
      });
    });

    // Calculate summary totals
    const summaryMonthlyTotals = {};
    let summaryGrandTotal = 0;

    // Draw summary table headers
    const startX = doc.x;
    let y = doc.y + 20;

    summaryHeaders.forEach((header, i) => {
      const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      const headerHeight = calculateTextHeight(header, summaryColumnWidths[i], 10) + 10;
      doc
        .rect(x, y, summaryColumnWidths[i], headerHeight)
        .fillAndStroke("#f0f0f0", "#000");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000")
        .text(header, x + 5, y + 5, { 
          width: summaryColumnWidths[i] - 10, 
          align: i === 0 ? "left" : "center" 
        });
    });

    y += 20;

    // Draw summary table rows
    Object.values(groupedData).forEach((row, rowIndex) => {
      const values = [
        `${row.distributor} || ${row.agency}`,
        ...sortedMonthKeys.map(key => {
          const value = row.monthlyData[key] || 0;
          summaryMonthlyTotals[key] = (summaryMonthlyTotals[key] || 0) + value;
          summaryGrandTotal += value;
          return value === 0 ? "-" : `${value.toFixed(2)}`; // Replace 0.00 with "-"
  }),
  row.totalAmount === 0 ? "-" : `${row.totalAmount.toFixed(2)}`, // Replace 0.00 with "-"
      ];

      const rowHeight = Math.max(
        ...values.map((val, i) => calculateTextHeight(val, summaryColumnWidths[i], 10))
      ) + 10;

      const rowColor = rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff";

      values.forEach((val, i) => {
        const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .rect(x, y, summaryColumnWidths[i], rowHeight)
          .fillAndStroke(rowColor, "#000");
        doc
          .font("Helvetica")
          .fontSize(10)
          .fill("#000")
          .text(val, x + 5, y + 5, { 
            width: summaryColumnWidths[i] - 10, 
            align: i === 0 ? "left" : "center" 
          });
      });

      y += rowHeight;
    });

    // Add summary totals row
    const summaryTotalRow = [
      "Total Amount",
      ...sortedMonthKeys.map(key => summaryMonthlyTotals[key] === 0 ? "-" : `${summaryMonthlyTotals[key].toFixed(2)}`),
      summaryGrandTotal === 0 ? "-" : `${summaryGrandTotal.toFixed(2)}`,
    ];

    const totalRowHeight = Math.max(
      ...summaryTotalRow.map((val, i) => calculateTextHeight(val, summaryColumnWidths[i], 10))
    ) + 10;

    summaryTotalRow.forEach((val, i) => {
      const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, summaryColumnWidths[i], totalRowHeight)
        .fillAndStroke("#d9edf7", "#000");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000")
        .text(val, x + 5, y + 5, { 
          width: summaryColumnWidths[i] - 10, 
          align: i === 0 ? "left" : "center" 
        });
    });

    y += totalRowHeight + 30;

    // Second Table - Product Breakdown
    const productHeaders = ["Product Name", ...monthNames, "Total Amount"];
    const productColumnWidths = productHeaders.map((header, i) => {
      if (i === 0) return 150; // Fixed width for product name
      return summaryColumnWidths[i]; // Same as summary table
    });

    // Add selected distributor/agency header
    const selectedDistributor = filters.distributor || "All Distributors";
    const selectedAgency = filters.agency || "All Agencies";
    const selectionHeader = `${selectedDistributor} || ${selectedAgency}`;
    const selectionWidth = productColumnWidths.reduce((a, b) => a + b, 0);
    
    doc
      .rect(startX, y, selectionWidth, 20)
      .stroke("#000");
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fill("#000")
      .text(selectionHeader, startX + 5, y + 5, { 
        width: selectionWidth - 10, 
        align: "left" 
      });

    y += 20;

    // Draw product table headers
    productHeaders.forEach((header, i) => {
      const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      const headerHeight = calculateTextHeight(header, productColumnWidths[i], 10) + 10;
      doc
        .rect(x, y, productColumnWidths[i], headerHeight)
        .fillAndStroke("#f0f0f0", "#000");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000")
        .text(header, x + 5, y + 5, { 
          width: productColumnWidths[i] - 10, 
          align: i === 0 ? "left" : "center" 
        });
    });

    y += 20;

    // Group data by products
    const productData = {};
    data.forEach(row => {
      if (!productData[row.product]) {
        productData[row.product] = {
          product: row.product,
          monthlyData: {},
          totalAmount: 0
        };
        sortedMonthKeys.forEach(key => {
          productData[row.product].monthlyData[key] = 0;
        });
      }

      Object.keys(row.monthlyData || {}).forEach(monthKey => {
        productData[row.product].monthlyData[monthKey] += row.monthlyData[monthKey];
        productData[row.product].totalAmount += row.monthlyData[monthKey];
      });
    });

    // Calculate product totals
    const productMonthlyTotals = {};
    let productGrandTotal = 0;

    // Draw product rows
    Object.values(productData).forEach((row, rowIndex) => {
      const values = [
        row.product,
        ...sortedMonthKeys.map(key => {
          const value = row.monthlyData[key] || 0;
          productMonthlyTotals[key] = (productMonthlyTotals[key] || 0) + value;
          productGrandTotal += value;
          return value === 0 ? "-" : `${value.toFixed(2)}`; // Replace 0.00 with "-"
        }),
        row.totalAmount === 0 ? "-" : `${row.totalAmount.toFixed(2)}`, // Replace 0.00 with "-"
      ];

      const rowHeight = Math.max(
        ...values.map((val, i) => calculateTextHeight(val, productColumnWidths[i], 10))
      ) + 10;

      const rowColor = rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff";

      values.forEach((val, i) => {
        const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .rect(x, y, productColumnWidths[i], rowHeight)
          .fillAndStroke(rowColor, "#000");
        doc
          .font("Helvetica")
          .fontSize(10)
          .fill("#000")
          .text(val, x + 5, y + 5, { 
            width: productColumnWidths[i] - 10, 
            align: i === 0 ? "left" : "center" 
          });
      });

      y += rowHeight;
    });

    // Add product totals row
    const productTotalRow = [
      "Total Amount",
      ...sortedMonthKeys.map((key) => (productMonthlyTotals[key] === 0 ? "-" : `${productMonthlyTotals[key].toFixed(2)}`)), // Replace 0.00 with "-"
      productGrandTotal === 0 ? "-" : `${productGrandTotal.toFixed(2)}`, // Replace 0.00 with "-"
    ];

    const productTotalRowHeight = Math.max(
      ...productTotalRow.map((val, i) => calculateTextHeight(val, productColumnWidths[i], 10))
    ) + 10;

    productTotalRow.forEach((val, i) => {
      const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, productColumnWidths[i], productTotalRowHeight)
        .fillAndStroke("#d9edf7", "#000");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000")
        .text(val, x + 5, y + 5, { 
          width: productColumnWidths[i] - 10, 
          align: i === 0 ? "left" : "center" 
        });
    });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
};

module.exports = generateReport;


