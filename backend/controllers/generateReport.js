// const PDFDocument = require("pdfkit");
// const fs = require("fs");

// const generateReport = (data, filters, outputPath, months) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 50, size: "A4", layout: 'landscape' });
//     const stream = fs.createWriteStream(outputPath);
//     doc.pipe(stream);

//     // Helper functions
//     const calculateTextWidth = (text, fontSize) => {
//       doc.fontSize(fontSize);
//       return doc.widthOfString(text);
//     };

//     const formatNumber = (number) => {
//       return new Intl.NumberFormat('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//       }).format(number);
//     };

//     const calculateTextHeight = (text, width, fontSize) => {
//       doc.fontSize(fontSize);
//       const lineHeight = fontSize * 1.2;
//       const lines = doc.heightOfString(text, { width });
//       return Math.ceil(lines / lineHeight) * lineHeight;
//     };

//     const isTotalAmountColumn = (columnIndex, totalAmountIndex) => columnIndex === totalAmountIndex;

//     // Constants for page layout
//     const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;
//     const PAGE_HEIGHT = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
//     const MIN_SPACE_REQUIRED = 100;

//     // Calculate base font size based on number of months (reduces for more months)
//     const monthCount = Object.keys(data[0]?.monthlyData || {}).length;
//     const baseFontSize = Math.max(8, 10 - Math.floor(monthCount / 6));

//     // Process filter strings into arrays
//     const selectedAgencies = Array.isArray(filters.agency) ? filters.agency : [];
//     const selectedProducts = Array.isArray(filters.product) ? filters.product : [];

//     // Group data by distributor first
//     const distributorsData = {};
//     data.forEach(row => {
//       if (!distributorsData[row.distributor]) {
//         distributorsData[row.distributor] = [];
//       }
//       distributorsData[row.distributor].push(row);
//     });

//     // Process each distributor separately
//     Object.keys(distributorsData).forEach(distributor => {
//       const distributorData = distributorsData[distributor];
      
//       // Filter data based on selected agencies and products
//       const filteredData = distributorData.filter(row => {
//         const agencyMatch = selectedAgencies.length === 0 || selectedAgencies.includes(row.agency);
//         const productMatch = selectedProducts.length === 0 || selectedProducts.includes(row.product);
//         return agencyMatch && productMatch;
//       });

//       if (filteredData.length === 0) return;

//       // Add distributor header
//       doc.fontSize(16)
//         .font("Helvetica-Bold")
//         .text(`Distributor: ${distributor}`, { align: "center" })
//         .moveDown(0.5);

//       if (filters.salesRep) {
//         doc.fontSize(12)
//           .font("Helvetica-Bold")
//           .text(`Sales Representative: ${filters.salesRep}`, { align: "center" })
//           .moveDown(0.5);
//       }

//       doc.fontSize(12)
//         .font("Helvetica")
//         .text(`${filters.fromDate} - ${filters.toDate}`, { align: "center" })
//         .moveDown(1.5);

//       // Get all unique month keys from the filtered data
//       const allMonthKeys = new Set();
//       filteredData.forEach(row => {
//         Object.keys(row.monthlyData || {}).forEach(key => {
//           allMonthKeys.add(key);
//         });
//       });

//       const sortedMonthKeys = Array.from(allMonthKeys).sort();

//       // Create months mapping
//       const monthsMap = months.reduce((acc, month) => {
//         acc[month.MonthID] = month.MonthName;
//         return acc;
//       }, {});

//       const monthNames = sortedMonthKeys.map((key) => {
//         const [year, month] = key.split("-");
//         return `${year}/${monthsMap[month] || month}`;
//       });

//       // First Table - Summary
//       const summaryHeaders = [
//         filters.salesRep ? "Distributor/SalesRep/Agency" : "Distributor/Agency",
//         ...monthNames,
//         "Total Amount"
//       ];

//       // Calculate column widths dynamically
//       const summaryColumnWidths = summaryHeaders.map((header, i) => {
//         const headerWidth = calculateTextWidth(header, baseFontSize);
        
//         let maxDataWidth = 0;
//         filteredData.forEach(row => {
//           let value = '';
//           if (i === 0) {
//             value = filters.salesRep && row.salesRep 
//               ? `${row.distributor}|${row.salesRep}|${row.agency}`
//               : `${row.distributor}|${row.agency}`;
//           } else if (i < summaryHeaders.length - 1) {
//             const amount = row.monthlyData[sortedMonthKeys[i-1]] || 0;
//             const quantity = row.monthlyQuantities[sortedMonthKeys[i-1]] || 0;
//             value = `${formatNumber(amount)} (${quantity})`;
//           } else {
//             value = `${formatNumber(row.totalAmount)} (${row.totalQuantity || 0})`;
//           }
//           maxDataWidth = Math.max(maxDataWidth, calculateTextWidth(value, baseFontSize));
//         });

//         return Math.min(Math.max(headerWidth, maxDataWidth) + 16, 120);
//       });

//       // Adjust column widths if needed
//       const totalWidth = summaryColumnWidths.reduce((a, b) => a + b, 0);
//       if (totalWidth > PAGE_WIDTH) {
//         const reductionFactor = PAGE_WIDTH / totalWidth;
//         summaryColumnWidths.forEach((width, i) => {
//           summaryColumnWidths[i] = width * reductionFactor;
//         });
//       }

//       // Group filtered data by distributor, salesRep and agency
//       const groupedData = {};
//       filteredData.forEach(row => {
//         const key = filters.salesRep 
//           ? `${row.distributor}|${row.salesRep}|${row.agency}`
//           : `${row.distributor}|${row.agency}`;
        
//         if (!groupedData[key]) {
//           groupedData[key] = {
//             distributor: row.distributor,
//             agency: row.agency,
//             ...(filters.salesRep && { salesRep: row.salesRep }),
//             monthlyData: {},
//             monthlyQuantities: {},
//             totalAmount: 0,
//             totalQuantity: 0
//           };
//         }

//         Object.keys(row.monthlyData || {}).forEach(monthKey => {
//           groupedData[key].monthlyData[monthKey] = 
//             (groupedData[key].monthlyData[monthKey] || 0) + row.monthlyData[monthKey];
//           groupedData[key].monthlyQuantities[monthKey] = 
//             (groupedData[key].monthlyQuantities[monthKey] || 0) + (row.monthlyQuantities[monthKey] || 0);
//           groupedData[key].totalAmount += row.monthlyData[monthKey];
//           groupedData[key].totalQuantity += (row.monthlyQuantities[monthKey] || 0);
//         });
//       });

//       // Calculate summary totals
//       const summaryMonthlyTotals = {};
//       const summaryMonthlyQuantityTotals = {};
//       let summaryGrandTotal = 0;
//       let summaryGrandTotalQuantity = 0;

//       // Draw summary table
//       const startX = doc.x;
//       let y = doc.y + 20;

//       if (y > PAGE_HEIGHT - MIN_SPACE_REQUIRED) {
//         doc.addPage();
//         y = doc.page.margins.top;
//       }

//       // Draw headers
//       summaryHeaders.forEach((header, i) => {
//         const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//         const headerHeight = calculateTextHeight(header, summaryColumnWidths[i], baseFontSize) + 10;
//         doc
//           .rect(x, y, summaryColumnWidths[i], headerHeight)
//           .fillAndStroke("#f0f0f0", "#000");
//         doc
//           .font("Helvetica-Bold")
//           .fontSize(baseFontSize)
//           .fill("#000")
//           .text(header, x + 5, y + 5, {
//             width: summaryColumnWidths[i] - 10,
//             align: i === 0 ? "left" : "center"
//           });
//       });

//       y += calculateTextHeight("Sample", summaryColumnWidths[0], baseFontSize) + 15;

//       // Draw rows
//       Object.values(groupedData).forEach((row, rowIndex) => {
//         const displayText = filters.salesRep && row.salesRep
//           ? `${row.distributor}|${row.salesRep}|${row.agency}`
//           : `${row.distributor}|${row.agency}`;

//         const values = [
//           displayText,
//           ...sortedMonthKeys.map(key => {
//             const amount = row.monthlyData[key] || 0;
//             const quantity = row.monthlyQuantities[key] || 0;
//             summaryMonthlyTotals[key] = (summaryMonthlyTotals[key] || 0) + amount;
//             summaryMonthlyQuantityTotals[key] = (summaryMonthlyQuantityTotals[key] || 0) + quantity;
//             summaryGrandTotal += amount;
//             summaryGrandTotalQuantity += quantity;
//             return amount === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
//           }),
//           row.totalAmount === 0 ? "-" : `${formatNumber(row.totalAmount)} (${row.totalQuantity || 0})`
//         ];

//         const rowHeight = Math.max(
//           ...values.map((val, i) => calculateTextHeight(val, summaryColumnWidths[i], baseFontSize))
//         ) + 10;

//         if (y + rowHeight > PAGE_HEIGHT - 50) {
//           doc.addPage();
//           y = doc.page.margins.top;
//           // Redraw headers
//           summaryHeaders.forEach((header, i) => {
//             const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//             const headerHeight = calculateTextHeight(header, summaryColumnWidths[i], baseFontSize) + 10;
//             doc
//               .rect(x, y, summaryColumnWidths[i], headerHeight)
//               .fillAndStroke("#f0f0f0", "#000");
//             doc
//               .font("Helvetica-Bold")
//               .fontSize(baseFontSize)
//               .fill("#000")
//               .text(header, x + 5, y + 5, {
//                 width: summaryColumnWidths[i] - 10,
//                 align: i === 0 ? "left" : "center"
//               });
//           });
//           y += calculateTextHeight("Sample", summaryColumnWidths[0], baseFontSize) + 15;
//         }

//         const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
//         values.forEach((val, i) => {
//           const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//           const cellColor = isTotalAmountColumn(i, summaryHeaders.length - 1) ? "#d9edf7" : rowColor;
//           doc
//             .rect(x, y, summaryColumnWidths[i], rowHeight)
//             .fillAndStroke(cellColor, "#000");
//           doc
//             .font("Helvetica")
//             .fontSize(baseFontSize)
//             .fill("#000")
//             .text(val, x + 5, y + 5, {
//               width: summaryColumnWidths[i] - 10,
//               align: i === 0 ? "left" : "right"
//             });
//         });
//         y += rowHeight;
//       });

//       // Add totals row
//       const summaryTotalRow = [
//         "Total Amount",
//         ...sortedMonthKeys.map(key => {
//           const amount = summaryMonthlyTotals[key] || 0;
//           const quantity = summaryMonthlyQuantityTotals[key] || 0;
//           return amount === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
//         }),
//         summaryGrandTotal === 0 ? "-" : `${formatNumber(summaryGrandTotal)} (${summaryGrandTotalQuantity || 0})`
//       ];

//       const totalRowHeight = Math.max(
//         ...summaryTotalRow.map((val, i) => calculateTextHeight(val, summaryColumnWidths[i], baseFontSize))
//       ) + 10;

//       if (y + totalRowHeight > PAGE_HEIGHT - 50) {
//         doc.addPage();
//         y = doc.page.margins.top;
//       }

//       summaryTotalRow.forEach((val, i) => {
//         const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//         doc
//           .rect(x, y, summaryColumnWidths[i], totalRowHeight)
//           .fillAndStroke("#d9edf7", "#000");
//         doc
//           .font("Helvetica-Bold")
//           .fontSize(baseFontSize)
//           .fill("#000")
//           .text(val, x + 5, y + 5, {
//             width: summaryColumnWidths[i] - 10,
//             align: i === 0 ? "left" : "right"
//           });
//       });

//       y += totalRowHeight + 30;

//       // Second Table - Product Breakdown (only if agencies or products are selected)
//       if (selectedAgencies.length > 0 || selectedProducts.length > 0) {
//         const productHeaders = ["Product Name", ...monthNames, "Total Amount"];
//         const productColumnWidths = summaryColumnWidths;

//         // Group data by agency and product
//         const agencyProductData = {};
//         filteredData.forEach(row => {
//           const agencyKey = filters.salesRep 
//             ? `${row.distributor}|${row.salesRep}|${row.agency}`
//             : `${row.distributor}|${row.agency}`;

//           if (!agencyProductData[agencyKey]) {
//             agencyProductData[agencyKey] = {
//               distributor: row.distributor,
//               agency: row.agency,
//               ...(filters.salesRep && { salesRep: row.salesRep }),
//               products: {}
//             };
//           }

//           if (!agencyProductData[agencyKey].products[row.product]) {
//             agencyProductData[agencyKey].products[row.product] = {
//               product: row.product,
//               monthlyData: {},
//               monthlyQuantities: {},
//               totalAmount: 0,
//               totalQuantity: 0
//             };
            
//             // Initialize all months
//             sortedMonthKeys.forEach(key => {
//               agencyProductData[agencyKey].products[row.product].monthlyData[key] = 0;
//               agencyProductData[agencyKey].products[row.product].monthlyQuantities[key] = 0;
//             });
//           }

//           Object.keys(row.monthlyData || {}).forEach(monthKey => {
//             agencyProductData[agencyKey].products[row.product].monthlyData[monthKey] += row.monthlyData[monthKey];
//             agencyProductData[agencyKey].products[row.product].monthlyQuantities[monthKey] += (row.monthlyQuantities[monthKey] || 0);
//             agencyProductData[agencyKey].products[row.product].totalAmount += row.monthlyData[monthKey];
//             agencyProductData[agencyKey].products[row.product].totalQuantity += (row.monthlyQuantities[monthKey] || 0);
//           });

//           console.log("Filters received:", {
//             agency: filters.agency,
//             product: filters.product,
//             isAgencyArray: Array.isArray(filters.agency),
//             isProductArray: Array.isArray(filters.product)
//           });
//         });

//         // Generate product tables
//         Object.values(agencyProductData).forEach(agencyData => {
//           if (y > PAGE_HEIGHT - MIN_SPACE_REQUIRED) {
//             doc.addPage();
//             y = doc.page.margins.top;
//           }

//           // Add agency header
//           const sectionHeader = filters.salesRep && agencyData.salesRep
//             ? `${agencyData.distributor} | ${agencyData.salesRep} | ${agencyData.agency}`
//             : `${agencyData.distributor} | ${agencyData.agency}`;
//           const sectionWidth = productColumnWidths.reduce((a, b) => a + b, 0);

//           doc.rect(startX, y, sectionWidth, 20).stroke("#000");
//           doc
//             .font("Helvetica-Bold")
//             .fontSize(baseFontSize)
//             .fill("#000")
//             .text(sectionHeader, startX + 5, y + 5, {
//               width: sectionWidth - 10,
//               align: "left"
//             });
//           y += 20;

//           // Draw product table headers
//           if (y + 40 > PAGE_HEIGHT - 50) {
//             doc.addPage();
//             y = doc.page.margins.top;
//           }

//           productHeaders.forEach((header, i) => {
//             const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//             const headerHeight = calculateTextHeight(header, productColumnWidths[i], baseFontSize) + 10;
//             doc
//               .rect(x, y, productColumnWidths[i], headerHeight)
//               .fillAndStroke("#f0f0f0", "#000");
//             doc
//               .font("Helvetica-Bold")
//               .fontSize(baseFontSize)
//               .fill("#000")
//               .text(header, x + 5, y + 5, {
//                 width: productColumnWidths[i] - 10,
//                 align: i === 0 ? "left" : "right"
//               });
//           });

//           y += calculateTextHeight("Sample", productColumnWidths[0], baseFontSize) + 15;

//           // Calculate product totals
//           const productMonthlyTotals = {};
//           const productMonthlyQuantityTotals = {};
//           let productGrandTotal = 0;
//           let productGrandTotalQuantity = 0;

//           // Draw product rows
//           Object.values(agencyData.products).forEach((row, rowIndex) => {
//             const values = [
//               row.product,
//               ...sortedMonthKeys.map(key => {
//                 const amount = row.monthlyData[key] || 0;
//                 const quantity = row.monthlyQuantities[key] || 0;
//                 productMonthlyTotals[key] = (productMonthlyTotals[key] || 0) + amount;
//                 productMonthlyQuantityTotals[key] = (productMonthlyQuantityTotals[key] || 0) + quantity;
//                 productGrandTotal += amount;
//                 productGrandTotalQuantity += quantity;
//                 return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
//               }),
//               row.totalAmount === 0 && row.totalQuantity === 0 ? "-" : `${formatNumber(row.totalAmount)} (${row.totalQuantity})`
//             ];

//             const rowHeight = Math.max(
//               ...values.map((val, i) => calculateTextHeight(val, productColumnWidths[i], baseFontSize))
//             ) + 10;

//             if (y + rowHeight > PAGE_HEIGHT - 50) {
//               doc.addPage();
//               y = doc.page.margins.top;
//               // Redraw headers
//               productHeaders.forEach((header, i) => {
//                 const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                 const headerHeight = calculateTextHeight(header, productColumnWidths[i], baseFontSize) + 10;
//                 doc
//                   .rect(x, y, productColumnWidths[i], headerHeight)
//                   .fillAndStroke("#f0f0f0", "#000");
//                 doc
//                   .font("Helvetica-Bold")
//                   .fontSize(baseFontSize)
//                   .fill("#000")
//                   .text(header, x + 5, y + 5, {
//                     width: productColumnWidths[i] - 10,
//                     align: i === 0 ? "left" : "right"
//                   });
//               });
//               y += calculateTextHeight("Sample", productColumnWidths[0], baseFontSize) + 15;
//             }

//             const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
//             values.forEach((val, i) => {
//               const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//               const cellColor = isTotalAmountColumn(i, productHeaders.length - 1) ? "#d9edf7" : rowColor;
//               doc
//                 .rect(x, y, productColumnWidths[i], rowHeight)
//                 .fillAndStroke(cellColor, "#000");
//               doc
//                 .font("Helvetica")
//                 .fontSize(baseFontSize)
//                 .fill("#000")
//                 .text(val, x + 5, y + 5, {
//                   width: productColumnWidths[i] - 10,
//                   align: i === 0 ? "left" : "right"
//                 });
//             });
//             y += rowHeight;
//           });

//           // Add product totals row
//           const productTotalRow = [
//             "Total Amount",
//             ...sortedMonthKeys.map(key => {
//               const amount = productMonthlyTotals[key] || 0;
//               const quantity = productMonthlyQuantityTotals[key] || 0;
//               return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
//             }),
//             productGrandTotal === 0 && productGrandTotalQuantity === 0 ? "-" : `${formatNumber(productGrandTotal)} (${productGrandTotalQuantity})`
//           ];

//           const productTotalRowHeight = Math.max(
//             ...productTotalRow.map((val, i) => calculateTextHeight(val, productColumnWidths[i], baseFontSize))
//           ) + 10;

//           if (y + productTotalRowHeight > PAGE_HEIGHT - 50) {
//             doc.addPage();
//             y = doc.page.margins.top;
//           }

//           productTotalRow.forEach((val, i) => {
//             const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//             doc
//               .rect(x, y, productColumnWidths[i], productTotalRowHeight)
//               .fillAndStroke("#d9edf7", "#000");
//             doc
//               .font("Helvetica-Bold")
//               .fontSize(baseFontSize)
//               .fill("#000")
//               .text(val, x + 5, y + 5, {
//                 width: productColumnWidths[i] - 10,
//                 align: i === 0 ? "left" : "right"
//               });
//           });
//           y += productTotalRowHeight + 30;
//         });
//       }
//     });

//     doc.end();
//     stream.on("finish", () => resolve());
//     stream.on("error", reject);
//   });
// };

// module.exports = generateReport;




const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateReport = (data, filters, outputPath, months) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4", layout: 'landscape' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Helper functions
    const calculateTextWidth = (text, fontSize) => {
      doc.fontSize(fontSize);
      return doc.widthOfString(text);
    };

    const formatNumber = (number) => {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
    };

    const calculateTextHeight = (text, width, fontSize) => {
      doc.fontSize(fontSize);
      const lineHeight = fontSize * 1.8;
      const lines = doc.heightOfString(text, { width });
      return Math.ceil(lines / lineHeight) * lineHeight;
    };

    const isTotalAmountColumn = (columnIndex, totalAmountIndex) => columnIndex === totalAmountIndex;

    // Constants for page layout
    const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const PAGE_HEIGHT = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
    const MIN_SPACE_REQUIRED = 100;

    // Calculate base font size based on number of months (reduces for more months)
    const monthCount = Object.keys(data[0]?.monthlyData || {}).length;
    const baseFontSize = Math.max(6, 8 - Math.floor(monthCount / 6));

    // Report Title
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Distributor / Agency / Product Report", { align: "center" })
      .moveDown(0.5);

    // Date range
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`${filters.fromDate} - ${filters.toDate}`, { align: "center" })
      .moveDown(1.5);

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

    // Group data by distributor first
    const distributorsMap = new Map();
    data.forEach(row => {
      if (!distributorsMap.has(row.distributor)) {
        distributorsMap.set(row.distributor, []);
      }
      distributorsMap.get(row.distributor).push(row);
    });

    // Process each distributor separately
    distributorsMap.forEach((distributorData, distributorName) => {
      // Add distributor header
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`Distributor: ${distributorName}`, { align: "left" })
        .moveDown(0.5);

      // Add Sales Rep to title if selected
      if (filters.salesRep) {
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(`Sales Representative: ${filters.salesRep}`, { align: "left" })
          .moveDown(0.5);
      }

      // Group data by distributor, salesRep and agency
      const groupedData = {};
      distributorData.forEach(row => {
        const key = filters.salesRep
          ? `${row.distributor}||${row.salesRep}||${row.agency}`
          : `${row.distributor}||${row.agency}`;

        if (!groupedData[key]) {
          groupedData[key] = {
            distributor: row.distributor,
            agency: row.agency,
            ...(filters.salesRep && { salesRep: row.salesRep }),
            monthlyData: {},
            monthlyQuantities: {},
            totalAmount: 0,
            totalQuantity: 0
          };
        }

        Object.keys(row.monthlyData || {}).forEach(monthKey => {
          groupedData[key].monthlyData[monthKey] =
            (groupedData[key].monthlyData[monthKey] || 0) + row.monthlyData[monthKey];
          groupedData[key].monthlyQuantities[monthKey] =
            (groupedData[key].monthlyQuantities[monthKey] || 0) + (row.monthlyQuantities[monthKey] || 0);
          groupedData[key].totalAmount += row.monthlyData[monthKey];
          groupedData[key].totalQuantity += (row.monthlyQuantities[monthKey] || 0);
        });
      });

      // First Table - Summary
      const summaryHeaders = [
        filters.salesRep ? "Distributor/SalesRep/Agency" : "Distributor/Agency",
        ...monthNames,
        "Total Amount"
      ];

      // Calculate column widths
      const summaryColumnWidths = summaryHeaders.map((header, i) => {
        const headerWidth = calculateTextWidth(header, baseFontSize);
        let maxDataWidth = 0;

        Object.values(groupedData).forEach(row => {
          let value = "";
          if (i === 0) {
            value = filters.salesRep && row.salesRep
              ? `${row.distributor}|${row.salesRep}|${row.agency}`
              : `${row.distributor}|${row.agency}`;
          } else if (i < summaryHeaders.length - 1) {
            const amount = row.monthlyData[sortedMonthKeys[i-1]] || 0;
            const quantity = row.monthlyQuantities[sortedMonthKeys[i-1]] || 0;
            value = `${formatNumber(amount)} (${quantity})`;
          } else {
            value = `${formatNumber(row.totalAmount)} (${row.totalQuantity || 0})`;
          }
          maxDataWidth = Math.max(maxDataWidth, calculateTextWidth(value, baseFontSize));
        });

        return Math.min(Math.max(headerWidth, maxDataWidth) + 16, 120);
      });

      // Adjust column widths if needed
      const totalWidth = summaryColumnWidths.reduce((a, b) => a + b, 0);
      if (totalWidth > PAGE_WIDTH) {
        const reductionFactor = PAGE_WIDTH / totalWidth;
        summaryColumnWidths.forEach((width, i) => {
          summaryColumnWidths[i] = width * reductionFactor;
        });
      }

      // Calculate summary totals
      const summaryMonthlyTotals = {};
      const summaryMonthlyQuantityTotals = {};
      let summaryGrandTotal = 0;
      let summaryGrandTotalQuantity = 0;

      // Draw summary table
      const startX = doc.x;
      let y = doc.y + 20;

      if (y > PAGE_HEIGHT - MIN_SPACE_REQUIRED) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      // Draw headers
      summaryHeaders.forEach((header, i) => {
        const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        const headerHeight = calculateTextHeight(header, summaryColumnWidths[i], baseFontSize) + 15;
        doc
          .rect(x, y, summaryColumnWidths[i], headerHeight)
          .fillAndStroke("#f0f0f0", "#000");
        doc
          .font("Helvetica-Bold")
          .fontSize(baseFontSize)
          .fill("#000")
          .text(header, x + 5, y + 5, {
            width: summaryColumnWidths[i] - 10,
            align: i === 0 ? "left" : "center"
          });
      });

      y += calculateTextHeight("Sample", summaryColumnWidths[0], baseFontSize) + 15;

      // Draw rows
      Object.values(groupedData).forEach((row, rowIndex) => {
        const displayText = filters.salesRep && row.salesRep
          ? `${row.distributor} | ${row.salesRep} | ${row.agency}`
          : `${row.distributor} | ${row.agency}`;

        const values = [
          displayText,
          ...sortedMonthKeys.map(key => {
            const amount = row.monthlyData[key] || 0;
            const quantity = row.monthlyQuantities[key] || 0;
            summaryMonthlyTotals[key] = (summaryMonthlyTotals[key] || 0) + amount;
            summaryMonthlyQuantityTotals[key] = (summaryMonthlyQuantityTotals[key] || 0) + quantity;
            summaryGrandTotal += amount;
            summaryGrandTotalQuantity += quantity;
            return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
          }),
          row.totalAmount === 0 && row.totalQuantity === 0 ? "-" : `${formatNumber(row.totalAmount)} (${row.totalQuantity})`
        ];

        const rowHeight = Math.max(
          ...values.map((val, i) => calculateTextHeight(val, summaryColumnWidths[i], baseFontSize))
        ) + 10;

        if (y + rowHeight > PAGE_HEIGHT - 50) {
          doc.addPage();
          y = doc.page.margins.top;
          // Redraw headers
          summaryHeaders.forEach((header, i) => {
            const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            const headerHeight = calculateTextHeight(header, summaryColumnWidths[i], baseFontSize) + 10;
            doc
              .rect(x, y, summaryColumnWidths[i], headerHeight)
              .fillAndStroke("#f0f0f0", "#000");
            doc
              .font("Helvetica-Bold")
              .fontSize(baseFontSize)
              .fill("#000")
              .text(header, x + 5, y + 5, {
                width: summaryColumnWidths[i] - 10,
                align: i === 0 ? "left" : "center"
              });
          });
          y += calculateTextHeight("Sample", summaryColumnWidths[0], baseFontSize) + 15;
        }

        const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#ffffff";
        values.forEach((val, i) => {
          const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          const cellColor = isTotalAmountColumn(i, summaryHeaders.length - 1) ? "#d9edf7" : rowColor;
          doc
            .rect(x, y, summaryColumnWidths[i], rowHeight)
            .fillAndStroke(cellColor, "#000");
          doc
            .font("Helvetica")
            .fontSize(baseFontSize)
            .fill("#000")
            .text(val, x + 5, y + 5, {
              width: summaryColumnWidths[i] - 10,
              align: i === 0 ? "left" : "right"
            });
        });
        y += rowHeight;
      });

      // Add totals row
      const summaryTotalRow = [
        "Total Amount",
        ...sortedMonthKeys.map(key => {
          const amount = summaryMonthlyTotals[key] || 0;
          const quantity = summaryMonthlyQuantityTotals[key] || 0;
          return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
        }),
        summaryGrandTotal === 0 && summaryGrandTotalQuantity === 0 ? "-" : `${formatNumber(summaryGrandTotal)} (${summaryGrandTotalQuantity})`
      ];

      const totalRowHeight = Math.max(
        ...summaryTotalRow.map((val, i) => calculateTextHeight(val, summaryColumnWidths[i], baseFontSize))
      ) + 10;

      if (y + totalRowHeight > PAGE_HEIGHT - 50) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      summaryTotalRow.forEach((val, i) => {
        const x = startX + summaryColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .rect(x, y, summaryColumnWidths[i], totalRowHeight)
          .fillAndStroke("#d9edf7", "#000");
        doc
          .font("Helvetica-Bold")
          .fontSize(baseFontSize)
          .fill("#000")
          .text(val, x + 5, y + 5, {
            width: summaryColumnWidths[i] - 10,
            align: i === 0 ? "left" : "right"
          });
      });

      y += totalRowHeight + 30;

      // Second Table - Product Breakdown
      const productHeaders = ["Product Name", ...monthNames, "Total Amount"];
      const productColumnWidths = summaryColumnWidths;

      // Group data by agency and product
      const agencyProductData = {};
      distributorData.forEach(row => {
        const agencyKey = filters.salesRep
          ? `${row.distributor}||${row.salesRep}||${row.agency}`
          : `${row.distributor}||${row.agency}`;

        if (!agencyProductData[agencyKey]) {
          agencyProductData[agencyKey] = {
            distributor: row.distributor,
            agency: row.agency,
            ...(filters.salesRep && { salesRep: row.salesRep }),
            products: {}
          };
        }

        if (!agencyProductData[agencyKey].products[row.product]) {
          agencyProductData[agencyKey].products[row.product] = {
            product: row.product,
            monthlyData: {},
            monthlyQuantities: {},
            totalAmount: 0,
            totalQuantity: 0
          };
          // Initialize all months
          sortedMonthKeys.forEach(key => {
            agencyProductData[agencyKey].products[row.product].monthlyData[key] = 0;
            agencyProductData[agencyKey].products[row.product].monthlyQuantities[key] = 0;
          });
        }

        Object.keys(row.monthlyData || {}).forEach(monthKey => {
          agencyProductData[agencyKey].products[row.product].monthlyData[monthKey] += row.monthlyData[monthKey];
          agencyProductData[agencyKey].products[row.product].monthlyQuantities[monthKey] += (row.monthlyQuantities[monthKey] || 0);
          agencyProductData[agencyKey].products[row.product].totalAmount += row.monthlyData[monthKey];
          agencyProductData[agencyKey].products[row.product].totalQuantity += (row.monthlyQuantities[monthKey] || 0);
        });
      });

      // Generate product tables
      Object.values(agencyProductData).forEach(agencyData => {
        if (y > PAGE_HEIGHT - MIN_SPACE_REQUIRED) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        // Add agency header
        const sectionHeader = filters.salesRep && agencyData.salesRep
          ? `${agencyData.distributor} | ${agencyData.salesRep} | ${agencyData.agency}`
          : `${agencyData.distributor} | ${agencyData.agency}`;
        const sectionWidth = productColumnWidths.reduce((a, b) => a + b, 0);
        doc.rect(startX, y, sectionWidth, 20).stroke("#000");
        doc
          .font("Helvetica-Bold")
          .fontSize(baseFontSize)
          .fill("#000")
          .text(sectionHeader, startX + 5, y + 5, {
            width: sectionWidth - 10,
            align: "left"
          });
        y += 20;

        // Draw product table headers
        if (y + 40 > PAGE_HEIGHT - 50) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        productHeaders.forEach((header, i) => {
          const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          const headerHeight = calculateTextHeight(header, productColumnWidths[i], baseFontSize) + 15;
          doc
            .rect(x, y, productColumnWidths[i], headerHeight)
            .fillAndStroke("#f0f0f0", "#000");
          doc
            .font("Helvetica-Bold")
            .fontSize(baseFontSize)
            .fill("#000")
            .text(header, x + 5, y + 5, {
              width: productColumnWidths[i] - 10,
              align: i === 0 ? "left" : "right"
            });
        });

        y += calculateTextHeight("Sample", productColumnWidths[0], baseFontSize) + 15;

        // Calculate product totals
        const productMonthlyTotals = {};
        const productMonthlyQuantityTotals = {};
        let productGrandTotal = 0;
        let productGrandTotalQuantity = 0;

        // Draw product rows
        Object.values(agencyData.products).forEach((row, rowIndex) => {
          const values = [
            row.product,
            ...sortedMonthKeys.map(key => {
              const amount = row.monthlyData[key] || 0;
              const quantity = row.monthlyQuantities[key] || 0;
              productMonthlyTotals[key] = (productMonthlyTotals[key] || 0) + amount;
              productMonthlyQuantityTotals[key] = (productMonthlyQuantityTotals[key] || 0) + quantity;
              productGrandTotal += amount;
              productGrandTotalQuantity += quantity;
              return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
            }),
            row.totalAmount === 0 && row.totalQuantity === 0 ? "-" : `${formatNumber(row.totalAmount)} (${row.totalQuantity})`
          ];

          const rowHeight = Math.max(
            ...values.map((val, i) => calculateTextHeight(val, productColumnWidths[i], baseFontSize))
          ) + 10;

          if (y + rowHeight > PAGE_HEIGHT - 50) {
            doc.addPage();
            y = doc.page.margins.top;
            // Redraw headers
            productHeaders.forEach((header, i) => {
              const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
              const headerHeight = calculateTextHeight(header, productColumnWidths[i], baseFontSize) + 10;
              doc
                .rect(x, y, productColumnWidths[i], headerHeight)
                .fillAndStroke("#f0f0f0", "#000");
              doc
                .font("Helvetica-Bold")
                .fontSize(baseFontSize)
                .fill("#000")
                .text(header, x + 5, y + 5, {
                  width: productColumnWidths[i] - 10,
                  align: i === 0 ? "left" : "right"
                });
            });
            y += calculateTextHeight("Sample", productColumnWidths[0], baseFontSize) + 10;
          }

          const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#ffffff";
          values.forEach((val, i) => {
            const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            const cellColor = isTotalAmountColumn(i, productHeaders.length - 1) ? "#d9edf7" : rowColor;
            doc
              .rect(x, y, productColumnWidths[i], rowHeight)
              .fillAndStroke(cellColor, "#000");
            doc
              .font("Helvetica")
              .fontSize(baseFontSize)
              .fill("#000")
              .text(val, x + 5, y + 5, {
                width: productColumnWidths[i] - 10,
                align: i === 0 ? "left" : "right"
              });
          });
          y += rowHeight;
        });

        // Add product totals row
        const productTotalRow = [
          "Total Amount",
          ...sortedMonthKeys.map(key => {
            const amount = productMonthlyTotals[key] || 0;
            const quantity = productMonthlyQuantityTotals[key] || 0;
            return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
          }),
          productGrandTotal === 0 && productGrandTotalQuantity === 0 ? "-" : `${formatNumber(productGrandTotal)} (${productGrandTotalQuantity})`
        ];

        const productTotalRowHeight = Math.max(
          ...productTotalRow.map((val, i) => calculateTextHeight(val, productColumnWidths[i], baseFontSize))
        ) + 10;

        if (y + productTotalRowHeight > PAGE_HEIGHT - 50) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        productTotalRow.forEach((val, i) => {
          const x = startX + productColumnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc
            .rect(x, y, productColumnWidths[i], productTotalRowHeight)
            .fillAndStroke("#d9edf7", "#000");
          doc
            .font("Helvetica-Bold")
            .fontSize(baseFontSize)
            .fill("#000")
            .text(val, x + 5, y + 5, {
              width: productColumnWidths[i] - 10,
              align: i === 0 ? "left" : "right"
            });
        });
        y += productTotalRowHeight + 30;
      });
    });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
};

module.exports = generateReport;