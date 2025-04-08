const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateReport = (data, filters, outputPath, months) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Report Title
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Distributor / Agency / Product Report", { align: "center" })
      .moveDown(0.5);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`(${filters.fromDate} - ${filters.toDate})`, { align: "center" })
      .moveDown(1.5);

    // Report Summary
    doc.fontSize(14).font("Helvetica-Bold").text("Report Summary", { underline: true }).moveDown(1);

    // Table headers
    const headers = ["Distributor / Agency"];
    const monthsMap = months.reduce((acc, month) => {
      acc[month.MonthID] = month.MonthName;
      return acc;
    }, {});

    const monthNames = Object.keys(data[0]?.monthlyData || {}).map((key) => {
      const [year, month] = key.split("-");
      return `${year} / ${monthsMap[month] || month}`;
    });

    headers.push(...monthNames);
    headers.push("Total Amount");

    const columnWidths = [200, ...Array(monthNames.length).fill(80), 100];
    const startX = doc.x;
    let y = doc.y;

    // Draw table headers with bold text and increased height
    const headerHeight = 30; // Increased header height
    headers.forEach((header, i) => {
      const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, columnWidths[i], headerHeight)
        .fillAndStroke("#f0f0f0", "#000") // Light gray background with black border
        .stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000") // Black text
        .text(header, x + 5, y + 8, { width: columnWidths[i] - 10, align: "center" }); // Adjusted text position
    });

    y += headerHeight;

    // Initialize totals for each month and grand total
    const monthlyTotals = {};
    let grandTotal = 0;

    // Draw table rows with alternating row colors
    data.forEach((row, rowIndex) => {
      const values = [
        row.distributor + " | " + row.agency,
        ...Object.keys(row.monthlyData).map((key) => {
          const value = row.monthlyData[key] || 0;
          monthlyTotals[key] = (monthlyTotals[key] || 0) + value; // Add to monthly totals
          grandTotal += value; // Add to grand total
          return `${value.toFixed(2)}`;
        }),
        `${row.totalAmount.toFixed(2)}`,
      ];

      const rowColor = rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff"; // Alternating row colors
      values.forEach((val, i) => {
        const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .rect(x, y, columnWidths[i], 20)
          .fillAndStroke(rowColor, "#000") // Fill with alternating colors and black border
          .stroke();
        doc
          .font("Helvetica")
          .fontSize(10)
          .fill("#000") // Black text
          .text(val, x + 5, y + 5, { width: columnWidths[i] - 10, align: "center" });
      });

      y += 20;
    });

    // Add "Total Amount" row with bold text and background color
    const totalRow = [
      "Total Amount",
      ...Object.keys(monthlyTotals).map((key) => `${monthlyTotals[key].toFixed(2)}`),
      `${grandTotal.toFixed(2)}`,
    ];

    totalRow.forEach((val, i) => {
      const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, columnWidths[i], 20)
        .fillAndStroke("#d9edf7", "#000") // Light blue background with black border
        .stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000") // Black text
        .text(val, x + 5, y + 5, { width: columnWidths[i] - 10, align: "center" });
    });

    y += 40; // Add spacing before the next table

    // Add a new table below the "Report Summary" table
    doc.fontSize(14).font("Helvetica-Bold").text("Detailed Report", { underline: true }).moveDown(1);

    // First row: Selected Distributor and Agency
    const firstRowHeaders = ["Selected Distributor", "Selected Agency"];
    const firstRowValues = [filters.distributor || "All", filters.agency || "All"];
    const firstRowWidths = [300, 300];

    firstRowHeaders.forEach((header, i) => {
      const x = startX + firstRowWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, firstRowWidths[i], 20)
        .fillAndStroke("#f0f0f0", "#000") // Light gray background
        .stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000")
        .text(header, x + 5, y + 5, { width: firstRowWidths[i] - 10, align: "center" });
    });

    y += 20;

    firstRowValues.forEach((value, i) => {
      const x = startX + firstRowWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, firstRowWidths[i], 20)
        .stroke();
      doc
        .font("Helvetica")
        .fontSize(10)
        .fill("#000")
        .text(value, x + 5, y + 5, { width: firstRowWidths[i] - 10, align: "center" });
    });

    y += 40;

    // Second row: Product details
    const productHeaders = ["Product Name", ...monthNames, "Total Amount"];
    const productColumnWidths = [200, ...Array(monthNames.length).fill(80), 100];

    productHeaders.forEach((header, i) => {
      const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .rect(x, y, productColumnWidths[i], 20)
        .fillAndStroke("#f0f0f0", "#000") // Light gray background
        .stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fill("#000")
        .text(header, x + 5, y + 5, { width: productColumnWidths[i] - 10, align: "center" });
    });

    y += 20;

    data.forEach((row, rowIndex) => {
      const values = [
        row.product || "N/A",
        ...Object.keys(row.monthlyData).map((key) => `${row.monthlyData[key]?.toFixed(2) || "0.00"}`),
        `${row.totalAmount.toFixed(2)}`,
      ];

      const rowColor = rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff"; // Alternating row colors
      values.forEach((val, i) => {
        const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .rect(x, y, productColumnWidths[i], 20)
          .fillAndStroke(rowColor, "#000") // Fill with alternating colors
          .stroke();
        doc
          .font("Helvetica")
          .fontSize(10)
          .fill("#000")
          .text(val, x + 5, y + 5, { width: productColumnWidths[i] - 10, align: "center" });
      });

      y += 20;
    });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
};

module.exports = generateReport;