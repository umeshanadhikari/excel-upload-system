// const PDFDocument = require("pdfkit");
// const fs = require("fs");

// const generateReport = (data, filters, outputPath, months) => {
//     return new Promise((resolve, reject) => {
//         const doc = new PDFDocument({ margin: 20, size: "A4", layout: 'landscape' });
//         const stream = fs.createWriteStream(outputPath);
//         doc.pipe(stream);

//         // Helper functions
//         const calculateTextWidth = (text, fontSize) => {
//             doc.fontSize(fontSize);
//             return doc.widthOfString(text);
//         };

//         const calculateTextHeight = (text, width, fontSize) => {
//             doc.fontSize(fontSize);
//             const lineHeight = fontSize * 1.2; // Tighter line spacing
//             return doc.heightOfString(text, { width }) * lineHeight;
//         };

//         const formatNumber = (number) => {
//             return new Intl.NumberFormat('en-US', { 
//                 minimumFractionDigits: 2, 
//                 maximumFractionDigits: 2 
//             }).format(number);
//         };

//         const isTotalAmountColumn = (columnIndex, totalAmountIndex) => columnIndex === totalAmountIndex;

//         // Constants for page layout
//         const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;
//         const PAGE_HEIGHT = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
//         const MIN_SPACE_REQUIRED = 100; // Increased minimum space required

//         // Calculate base font size based on number of months
//         const monthCount = Object.keys(data[0]?.monthlyData || {}).length;
//         const baseFontSize = Math.max(5, 7 - Math.floor(monthCount / 6));

//         // Report Title
//         doc.fontSize(12)
//            .font("Helvetica-Bold")
//            .text("Distributor / Agency / Product Report", { align: "center" })
//            .moveDown(0.3);

//         // Date range
//         doc.fontSize(8)
//            .font("Helvetica")
//            .text(`${filters.fromDate} - ${filters.toDate}`, { align: "center" })
//            .moveDown(0.5);

//         // Get all unique month keys from the data and sort them correctly
//         const allMonthKeys = new Set();
//         data.forEach(row => {
//             Object.keys(row.monthlyData || {}).forEach(key => {
//                 allMonthKeys.add(key);
//             });
//         });

//         const sortedMonthKeys = Array.from(allMonthKeys).sort((a, b) => {
//             const [aYear, aMonth] = a.split('-').map(Number);
//             const [bYear, bMonth] = b.split('-').map(Number);
//             if (aYear !== bYear) return aYear - bYear;
//             return aMonth - bMonth;
//         });

//         const monthsMap = months.reduce((acc, month) => {
//             acc[month.MonthID] = month.MonthName;
//             return acc;
//         }, {});

//         const monthNames = sortedMonthKeys.map((key) => {
//             const [year, month] = key.split("-");
//             const monthName = monthsMap[month] || month;
//             return `${year}/${monthName.substring(0, 3)}`;
//         });

//         // Group data by distributor
//         const distributorsMap = new Map();
//         data.forEach(row => {
//             if (!distributorsMap.has(row.distributor)) {
//                 distributorsMap.set(row.distributor, []);
//             }
//             distributorsMap.get(row.distributor).push(row);
//         });

//         // Process each distributor separately
//         distributorsMap.forEach((distributorData, distributorName) => {
//             // Check if we need a new page before starting a new distributor section
//             if (doc.y > PAGE_HEIGHT - 100) { // Leave space for at least some content
//                 doc.addPage();
//             }

//             // Add distributor header
//             doc.fontSize(12)
//                .font("Helvetica-Bold")
//                .text(`Distributor: ${distributorName}`, { align: "left" })
//                .moveDown(0.3);

//             if (filters.salesRep) {
//                 doc.fontSize(8)
//                    .font("Helvetica-Bold")
//                    .text(`Sales Representative: ${filters.salesRep}`, { align: "left" })
//                    .moveDown(0.5);
//             }

//             // Group data by distributor, salesRep and agency
//             const groupedData = {};
//             distributorData.forEach(row => {
//                 const key = filters.salesRep
//                     ? `${row.distributor}||${row.salesRep}||${row.agency}`
//                     : `${row.distributor}||${row.agency}`;

//                 if (!groupedData[key]) {
//                     groupedData[key] = {
//                         distributor: row.distributor,
//                         agency: row.agency,
//                         ...(filters.salesRep && { salesRep: row.salesRep }),
//                         monthlyData: {},
//                         monthlyQuantities: {},
//                         totalAmount: 0,
//                         totalQuantity: 0
//                     };
//                 }

//                 Object.keys(row.monthlyData || {}).forEach(monthKey => {
//                     groupedData[key].monthlyData[monthKey] =
//                         (groupedData[key].monthlyData[monthKey] || 0) + row.monthlyData[monthKey];
//                     groupedData[key].monthlyQuantities[monthKey] =
//                         (groupedData[key].monthlyQuantities[monthKey] || 0) + (row.monthlyQuantities[monthKey] || 0);
//                     groupedData[key].totalAmount += row.monthlyData[monthKey];
//                     groupedData[key].totalQuantity += (row.monthlyQuantities[monthKey] || 0);
//                 });
//             });

//             // First Table - Summary
//             const summaryHeaders = [
//                 filters.salesRep ? "Distributor/SalesRep/Agency" : "Distributor/Agency",
//                 ...monthNames,
//                 "Total Amount"
//             ];

//             const calculateColumnWidths = (headers, dataRows) => {
//                 return headers.map((header, i) => {
//                     const headerWidth = calculateTextWidth(header, baseFontSize);
//                     let maxDataWidth = 0;

//                     dataRows.forEach(row => {
//                         let value = "";
//                         if (i === 0) {
//                             value = filters.salesRep && row.salesRep
//                                 ? `${row.distributor}|${row.salesRep}|${row.agency}`
//                                 : `${row.distributor}|${row.agency}`;
//                         } else if (i < headers.length - 1) {
//                             const monthKey = sortedMonthKeys[i-1];
//                             const amount = row.monthlyData[monthKey] || 0;
//                             value = `${formatNumber(amount)} `;
//                         } else {
//                             value = `${formatNumber(row.totalAmount)} `;
//                         }
                        
//                         maxDataWidth = Math.max(maxDataWidth, calculateTextWidth(value, baseFontSize));
//                     });

//                     return Math.min(Math.max(headerWidth, maxDataWidth) + 10, 60); // Slightly wider columns
//                 });
//             };

//             const summaryColumnWidths = calculateColumnWidths(summaryHeaders, Object.values(groupedData));

//             const adjustColumnWidths = (widths) => {
//                 const totalWidth = widths.reduce((a, b) => a + b, 0);
//                 if (totalWidth > PAGE_WIDTH) {
//                     const reductionFactor = PAGE_WIDTH / totalWidth;
//                     return widths.map((width) => Math.max(30, width * reductionFactor));
//                 }
//                 return widths;
//             };

//             const adjustedSummaryWidths = adjustColumnWidths(summaryColumnWidths);

//             // Calculate summary totals
//             const summaryMonthlyTotals = {};
//             const summaryMonthlyQuantityTotals = {};
//             let summaryGrandTotal = 0;
//             let summaryGrandTotalQuantity = 0;

//             // Draw summary table
//             const startX = doc.page.margins.left;
//             let y = doc.y;

//             // Check if we have enough space for at least 3 rows (header + 1 data + total)
//             const sampleRowHeight = calculateTextHeight("Sample", adjustedSummaryWidths[0], baseFontSize) + 10;
//             if (y + (sampleRowHeight * 3) > PAGE_HEIGHT - doc.page.margins.bottom) {
//                 doc.addPage();
//                 y = doc.page.margins.top;
//             }

//             // Draw headers
//             summaryHeaders.forEach((header, i) => {
//                 const x = startX + adjustedSummaryWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                 const headerHeight = calculateTextHeight(header, adjustedSummaryWidths[i], baseFontSize) + 10;
                
//                 doc.rect(x, y, adjustedSummaryWidths[i], headerHeight)
//                    .fillAndStroke("#f0f0f0", "#000");
                
//                 doc.font("Helvetica-Bold")
//                    .fontSize(baseFontSize)
//                    .fill("#000")
//                    .text(header, x + 5, y + 5, {
//                        width: adjustedSummaryWidths[i] - 10,
//                        align: i === 0 ? "left" : "center"
//                    });
//             });

//             y += calculateTextHeight("Sample", adjustedSummaryWidths[0], baseFontSize) + 10;

//             // Draw rows
//             Object.values(groupedData).forEach((row, rowIndex) => {
//                 const displayText = filters.salesRep && row.salesRep
//                     ? `${row.distributor}|${row.salesRep}|${row.agency}`
//                     : `${row.distributor}|${row.agency}`;

//                 const values = [
//                     displayText,
//                     ...sortedMonthKeys.map(key => {
//                         const amount = row.monthlyData[key] || 0;
//                         const quantity = row.monthlyQuantities[key] || 0;
//                         summaryMonthlyTotals[key] = (summaryMonthlyTotals[key] || 0) + amount;
//                         summaryMonthlyQuantityTotals[key] = (summaryMonthlyQuantityTotals[key] || 0) + quantity;
//                         summaryGrandTotal += amount;
//                         summaryGrandTotalQuantity += quantity;
//                         return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} `;
//                     }),
//                     row.totalAmount === 0 && row.totalQuantity === 0 ? "-" : `${formatNumber(row.totalAmount)} `
//                 ];

//                 const rowHeight = Math.max(
//                     ...values.map((val, j) => calculateTextHeight(val, adjustedSummaryWidths[j], baseFontSize))
//                 ) + 8;

//                 // Check if we need a new page before drawing this row
//                 if (y + rowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
//                     doc.addPage();
//                     y = doc.page.margins.top;
//                     // Redraw headers
//                     summaryHeaders.forEach((header, j) => {
//                         const x = startX + adjustedSummaryWidths.slice(0, j).reduce((a, b) => a + b, 0);
//                         const headerHeight = calculateTextHeight(header, adjustedSummaryWidths[j], baseFontSize) + 10;
//                         doc.rect(x, y, adjustedSummaryWidths[j], headerHeight)
//                            .fillAndStroke("#f0f0f0", "#000");
//                         doc.font("Helvetica-Bold")
//                            .fontSize(baseFontSize)
//                            .fill("#000")
//                            .text(header, x + 5, y + 5, {
//                                width: adjustedSummaryWidths[j] - 10,
//                                align: j === 0 ? "left" : "center"
//                            });
//                     });
//                     y += calculateTextHeight("Sample", adjustedSummaryWidths[0], baseFontSize) + 10;
//                 }

//                 const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
//                 values.forEach((val, j) => {
//                     const x = startX + adjustedSummaryWidths.slice(0, j).reduce((a, b) => a + b, 0);
//                     const cellColor = isTotalAmountColumn(j, summaryHeaders.length - 1) ? "#d9edf7" : rowColor;
//                     doc.rect(x, y, adjustedSummaryWidths[j], rowHeight)
//                        .fillAndStroke(cellColor, "#000");
//                     doc.font("Helvetica")
//                        .fontSize(baseFontSize)
//                        .fill("#000")
//                        .text(val, x + 5, y + 5, {
//                            width: adjustedSummaryWidths[j] - 10,
//                            align: j === 0 ? "left" : "right"
//                        });
//                 });
//                 y += rowHeight;
//             });

//             // Add totals row
//             const summaryTotalRow = [
//                 "Total Amount",
//                 ...sortedMonthKeys.map(key => {
//                     const amount = summaryMonthlyTotals[key] || 0;
//                     const quantity = summaryMonthlyQuantityTotals[key] || 0;
//                     return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} `;
//                 }),
//                 summaryGrandTotal === 0 && summaryGrandTotalQuantity === 0 ? "-" : `${formatNumber(summaryGrandTotal)} `
//             ];

//             const totalRowHeight = Math.max(
//                 ...summaryTotalRow.map((val, i) => calculateTextHeight(val, adjustedSummaryWidths[i], baseFontSize))
//             ) + 10;

//             // Check if we need a new page before drawing the total row
//             if (y + totalRowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
//                 doc.addPage();
//                 y = doc.page.margins.top;
//             }

//             summaryTotalRow.forEach((val, i) => {
//                 const x = startX + adjustedSummaryWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                 doc.rect(x, y, adjustedSummaryWidths[i], totalRowHeight)
//                    .fillAndStroke("#d9edf7", "#000");
//                 doc.font("Helvetica-Bold")
//                    .fontSize(baseFontSize)
//                    .fill("#000")
//                    .text(val, x + 5, y + 5, {
//                        width: adjustedSummaryWidths[i] - 7,
//                        align: i === 0 ? "left" : "right"
//                    });
//             });

//             y += totalRowHeight + 20;

//             // Second Table - Product Breakdown
//             const productHeaders = ["Product Name", ...monthNames, "Total Amount"];
//             const productColumnWidths = calculateColumnWidths(productHeaders, 
//                 Object.values(distributorData).flatMap(row => [row]));

//             const adjustedProductWidths = adjustColumnWidths(productColumnWidths);

//             // Group data by agency and product
//             const agencyProductData = {};
//             distributorData.forEach(row => {
//                 const agencyKey = filters.salesRep
//                     ? `${row.distributor}||${row.salesRep}||${row.agency}`
//                     : `${row.distributor}||${row.agency}`;

//                 if (!agencyProductData[agencyKey]) {
//                     agencyProductData[agencyKey] = {
//                         distributor: row.distributor,
//                         agency: row.agency,
//                         ...(filters.salesRep && { salesRep: row.salesRep }),
//                         products: {}
//                     };
//                 }

//                 if (!agencyProductData[agencyKey].products[row.product]) {
//                     agencyProductData[agencyKey].products[row.product] = {
//                         product: row.product,
//                         monthlyData: {},
//                         monthlyQuantities: {},
//                         totalAmount: 0,
//                         totalQuantity: 0
//                     };

//                     // Initialize all months
//                     sortedMonthKeys.forEach(key => {
//                         agencyProductData[agencyKey].products[row.product].monthlyData[key] = 0;
//                         agencyProductData[agencyKey].products[row.product].monthlyQuantities[key] = 0;
//                     });
//                 }

//                 Object.keys(row.monthlyData || {}).forEach(monthKey => {
//                     agencyProductData[agencyKey].products[row.product].monthlyData[monthKey] += row.monthlyData[monthKey];
//                     agencyProductData[agencyKey].products[row.product].monthlyQuantities[monthKey] += (row.monthlyQuantities[monthKey] || 0);
//                     agencyProductData[agencyKey].products[row.product].totalAmount += row.monthlyData[monthKey];
//                     agencyProductData[agencyKey].products[row.product].totalQuantity += (row.monthlyQuantities[monthKey] || 0);
//                 });
//             });

//             // Generate product tables
//             Object.values(agencyProductData).forEach(agencyData => {
//                 // Check if we need a new page before starting a new product section
//                 if (y > PAGE_HEIGHT - 200) { // Leave space for at least some content
//                     doc.addPage();
//                     y = doc.page.margins.top;
//                 }

//                 // Add agency header
//                 const sectionHeader = filters.salesRep && agencyData.salesRep 
//                     ? `${agencyData.distributor} | ${agencyData.salesRep} | ${agencyData.agency}`
//                     : `${agencyData.distributor} | ${agencyData.agency}`;

//                 const sectionWidth = adjustedProductWidths.reduce((a, b) => a + b, 0);
                
//                 // Check if we have space for the header
//                 if (y + 30 > PAGE_HEIGHT - doc.page.margins.bottom) {
//                     doc.addPage();
//                     y = doc.page.margins.top;
//                 }

//                 doc.rect(startX, y, sectionWidth, 20)
//                    .stroke("#000");
                
//                 doc.font("Helvetica-Bold")
//                    .fontSize(baseFontSize)
//                    .fill("#000")
//                    .text(sectionHeader, startX + 5, y + 5, {
//                        width: sectionWidth - 10,
//                        align: "left"
//                    });

//                 y += 25;

//                 // Draw product table headers
//                 if (y + 40 > PAGE_HEIGHT - doc.page.margins.bottom) {
//                     doc.addPage();
//                     y = doc.page.margins.top;
//                 }

//                 productHeaders.forEach((header, i) => {
//                     const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                     const headerHeight = calculateTextHeight(header, adjustedProductWidths[i], baseFontSize) + 10;
                    
//                     doc.rect(x, y, adjustedProductWidths[i], headerHeight)
//                        .fillAndStroke("#f0f0f0", "#000");
                    
//                     doc.font("Helvetica-Bold")
//                        .fontSize(baseFontSize)
//                        .fill("#000")
//                        .text(header, x + 5, y + 5, {
//                            width: adjustedProductWidths[i] - 10,
//                            align: i === 0 ? "left" : "right"
//                        });
//                 });

//                 y += calculateTextHeight("Sample", adjustedProductWidths[0], baseFontSize) + 10;

//                 // Calculate product totals
//                 const productMonthlyTotals = {};
//                 const productMonthlyQuantityTotals = {};
//                 let productGrandTotal = 0;
//                 let productGrandTotalQuantity = 0;

//                 // Draw product rows
//                 Object.values(agencyData.products).forEach((row, rowIndex) => {
//                     const values = [
//                         row.product,
//                         ...sortedMonthKeys.map(key => {
//                             const amount = row.monthlyData[key] || 0;
//                             const quantity = row.monthlyQuantities[key] || 0;
//                             productMonthlyTotals[key] = (productMonthlyTotals[key] || 0) + amount;
//                             productMonthlyQuantityTotals[key] = (productMonthlyQuantityTotals[key] || 0) + quantity;
//                             productGrandTotal += amount;
//                             productGrandTotalQuantity += quantity;
//                             return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
//                         }),
//                         row.totalAmount === 0 && row.totalQuantity === 0 ? "-" : `${formatNumber(row.totalAmount)} (${row.totalQuantity})`
//                     ];

//                     const rowHeight = Math.max(
//                         ...values.map((val, i) => calculateTextHeight(val, adjustedProductWidths[i], baseFontSize))
//                     ) + 10;

//                     // Check if we need a new page before drawing this row
//                     if (y + rowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
//                         doc.addPage();
//                         y = doc.page.margins.top;
//                         // Redraw headers
//                         productHeaders.forEach((header, i) => {
//                             const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                             const headerHeight = calculateTextHeight(header, adjustedProductWidths[i], baseFontSize) + 10;
//                             doc.rect(x, y, adjustedProductWidths[i], headerHeight)
//                                .fillAndStroke("#f0f0f0", "#000");
//                             doc.font("Helvetica-Bold")
//                                .fontSize(baseFontSize)
//                                .fill("#000")
//                                .text(header, x + 5, y + 5, {
//                                    width: adjustedProductWidths[i] - 10,
//                                    align: i === 0 ? "left" : "right"
//                                });
//                         });
//                         y += calculateTextHeight("Sample", adjustedProductWidths[0], baseFontSize) + 10;
//                     }

//                     const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
//                     values.forEach((val, i) => {
//                         const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                         const cellColor = isTotalAmountColumn(i, productHeaders.length - 1) ? "#d9edf7" : rowColor;
//                         doc.rect(x, y, adjustedProductWidths[i], rowHeight)
//                            .fillAndStroke(cellColor, "#000");
//                         doc.font("Helvetica")
//                            .fontSize(baseFontSize)
//                            .fill("#000")
//                            .text(val, x + 5, y + 5, {
//                                width: adjustedProductWidths[i] - 7,
//                                align: i === 0 ? "left" : "right"
//                            });
//                     });
//                     y += rowHeight;
//                 });

//                 // Add product totals row
//                 const productTotalRow = [
//                     "Total Amount",
//                     ...sortedMonthKeys.map(key => {
//                         const amount = productMonthlyTotals[key] || 0;
//                         const quantity = productMonthlyQuantityTotals[key] || 0;
//                         return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} (${quantity})`;
//                     }),
//                     productGrandTotal === 0 && productGrandTotalQuantity === 0 ? "-" : `${formatNumber(productGrandTotal)} (${productGrandTotalQuantity})`
//                 ];

//                 const productTotalRowHeight = Math.max(
//                     ...productTotalRow.map((val, i) => calculateTextHeight(val, adjustedProductWidths[i], baseFontSize))
//                 ) + 8;

//                 // Check if we need a new page before drawing the total row
//                 if (y + productTotalRowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
//                     doc.addPage();
//                     y = doc.page.margins.top;
//                 }

//                 productTotalRow.forEach((val, i) => {
//                     const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
//                     doc.rect(x, y, adjustedProductWidths[i], productTotalRowHeight)
//                        .fillAndStroke("#d9edf7", "#000");
//                     doc.font("Helvetica-Bold")
//                        .fontSize(baseFontSize)
//                        .fill("#000")
//                        .text(val, x + 5, y + 5, {
//                            width: adjustedProductWidths[i] - 7,
//                            align: i === 0 ? "left" : "right"
//                        });
//                 });

//                 y += productTotalRowHeight + 30;
//             });

//             // Add extra space between distributors
//             y += 40;
//         });

//         doc.end();
//         stream.on("finish", () => resolve());
//         stream.on("error", reject);
//     });
// };

// module.exports = generateReport;


const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateReport = (data, filters, outputPath, months) => {
    console.log("Starting PDF generation with data:", {
        dataLength: data.length,
        filters,
        monthsCount: months.length
    });
    console.log("First data item:", data[0]);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 20, size: "A4", layout: 'landscape' });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Helper functions
        const calculateTextWidth = (text, fontSize) => {
            doc.fontSize(fontSize);
            return doc.widthOfString(text);
        };

        const calculateTextHeight = (text, width, fontSize) => {
            doc.fontSize(fontSize);
            const lineHeight = fontSize * 1.5; // Reduced line height for tighter spacing
            const lines = doc.heightOfString(text, { width });
            return Math.ceil(lines / lineHeight) * lineHeight;
        };

        const formatNumber = (number) => {
            return new Intl.NumberFormat('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }).format(number);
        };

        const checkPageBreak = (doc, y, rowHeight, pageHeight, margins) => {
            if (y + rowHeight > pageHeight - doc.page.margins.bottom) {
                doc.addPage();
                return doc.page.margins.top;
            }
            return y;
        };

        

        const isTotalAmountColumn = (columnIndex, totalAmountIndex) => columnIndex === totalAmountIndex;

        // Constants for page layout
        const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const PAGE_HEIGHT = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
        const MIN_SPACE_REQUIRED = 100;

        // Calculate base font size based on number of months
        const monthCount = Object.keys(data[0]?.monthlyData || {}).length;
        const baseFontSize = Math.max(5, 7 - Math.floor(monthCount / 6)); // More aggressive font size reduction

        // Report Title
        doc.fontSize(12)
           .font("Helvetica-Bold")
           .text("Distributor / Agency / Product Report", { align: "center" })
           .moveDown(0.3);

        // Date range
        doc.fontSize(8)
           .font("Helvetica")
           .text(`${filters.fromDate} - ${filters.toDate}`, { align: "center" })
           .moveDown(1);

        // Get all unique month keys from the data and sort them correctly
        const allMonthKeys = new Set();
        data.forEach(row => {
            Object.keys(row.monthlyData || {}).forEach(key => {
                allMonthKeys.add(key);
            });
        });

        // Sort months correctly by year and month number
        const sortedMonthKeys = Array.from(allMonthKeys).sort((a, b) => {
            const [aYear, aMonth] = a.split('-').map(Number);
            const [bYear, bMonth] = b.split('-').map(Number);
            
            if (aYear !== bYear) return aYear - bYear;
            return aMonth - bMonth;
        });

        // Create months mapping
        const monthsMap = months.reduce((acc, month) => {
            acc[month.MonthID] = month.MonthName;
            return acc;
        }, {});

        // Format month names for display (YYYY/MMM)
        const monthNames = sortedMonthKeys.map((key) => {
            const [year, month] = key.split("-");
            const monthName = monthsMap[month] || month;
            return `${year}/${monthName.substring(0, 3)}`; // Abbreviated month names
        });

        // Group data by distributor first
        const distributorsMap = new Map();
        const distributorSalesReps = new Map(); // To track sales reps per distributor
        data.forEach(row => {
            if (!distributorsMap.has(row.distributor)) {
                distributorsMap.set(row.distributor, []);
                distributorSalesReps.set(row.distributor, new Set());
            }
            distributorsMap.get(row.distributor).push(row);
            if (row.salesRep) {
        distributorSalesReps.get(row.distributor).add(row.salesRep);
      }

        });

        // Process each distributor separately
        distributorsMap.forEach((distributorData, distributorName) => {

            // Add space before distributor header unless it's the first on the first page
            if (doc.y > doc.page.margins.top + 10) {
                doc.y += 30; // Space between previous table and new distributor header
            }

        // If near page bottom, add a new page
        if (doc.y > PAGE_HEIGHT - 150) {
            doc.addPage();
            doc.y = doc.page.margins.top + 10;
        }

            // Add distributor header
            doc.x = doc.page.margins.left;
            doc.fontSize(12)
               .font("Helvetica-Bold")
               .text(`Distributor: ${distributorName}`, { align: "left" })
               .moveDown(0.3);

            // Add Sales Rep to title if selected
            if (filters.salesRep) {
                const repsForDistributor = Array.from(distributorSalesReps.get(distributorName));
                if (repsForDistributor.length > 0) {
                    doc.fontSize(8)
                        .font("Helvetica-Bold")
                        .text(`Sales Representative: ${repsForDistributor.join(", ")}`, { align: "left" })
                        .moveDown(0.5);
        }
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
            const calculateColumnWidths = (headers, dataRows) => {
                return headers.map((header, i) => {
                    const headerWidth = calculateTextWidth(header, baseFontSize);
                    let maxDataWidth = 0;

                    dataRows.forEach(row => {
                        let value = "";
                        if (i === 0) {
                            value = filters.salesRep && row.salesRep
                                ? `${row.distributor}|${row.salesRep}|${row.agency}`
                                : `${row.distributor}|${row.agency}`;
                        } else if (i < headers.length - 1) {
                            const monthKey = sortedMonthKeys[i-1];
                            const amount = row.monthlyData[monthKey] || 0;
                    
                            value = `${formatNumber(amount)} `;
                        } else {
                            value = `${formatNumber(row.totalAmount)} `;
                        }
                        
                        maxDataWidth = Math.max(maxDataWidth, calculateTextWidth(value, baseFontSize));
                    });

                    return Math.min(Math.max(headerWidth, maxDataWidth) + 10, 50);
                });
            };

            const summaryColumnWidths = calculateColumnWidths(summaryHeaders, data);

            // Adjust column widths if needed
            const adjustColumnWidths = (widths) => {
                const totalWidth = widths.reduce((a, b) => a + b, 0);
                if (totalWidth > PAGE_WIDTH) {
                    const reductionFactor = (PAGE_WIDTH ) / totalWidth;
                    return widths.map((width) => Math.max(30, width * reductionFactor));
                }
                return widths;
            };
            
            const adjustedSummaryWidths = adjustColumnWidths(summaryColumnWidths);

            // Calculate summary totals
            const summaryMonthlyTotals = {};
            const summaryMonthlyQuantityTotals = {};
            let summaryGrandTotal = 0;
            let summaryGrandTotalQuantity = 0;

            // Draw summary table
            const startX = doc.page.margins.left;
            let y = doc.y + 20;

            if (y > PAGE_HEIGHT - MIN_SPACE_REQUIRED) {
                doc.addPage();
                y = doc.page.margins.top;
            }

            // Draw headers
            summaryHeaders.forEach((header, i) => {
                const x = startX + adjustedSummaryWidths.slice(0, i).reduce((a, b) => a + b, 0);
                const headerHeight = calculateTextHeight(header, adjustedSummaryWidths[i], baseFontSize) + 10;
                
                doc.rect(x, y, adjustedSummaryWidths[i], headerHeight)
                   .fillAndStroke("#f0f0f0", "#000");
                
                doc.font("Helvetica-Bold")
                   .fontSize(baseFontSize)
                   .fill("#000")
                   .text(header, x + 5, y + 5, {
                       width: adjustedSummaryWidths[i] - 10,
                       align: i === 0 ? "left" : "center"
                   });
            });

            y += calculateTextHeight("Sample", adjustedSummaryWidths[0], baseFontSize) + 10;

            // Draw rows
            Object.values(groupedData).forEach((row, rowIndex) => {
                const displayText = filters.salesRep && row.salesRep
                    ? `${row.distributor}|${row.salesRep}|${row.agency}`
                    : `${row.distributor}|${row.agency}`;

                const values = [
                    displayText,
                    ...sortedMonthKeys.map(key => {
                        const amount = row.monthlyData[key] || 0;
                        const quantity = row.monthlyQuantities[key] || 0;
                        summaryMonthlyTotals[key] = (summaryMonthlyTotals[key] || 0) + amount;
                        summaryMonthlyQuantityTotals[key] = (summaryMonthlyQuantityTotals[key] || 0) + quantity;
                        summaryGrandTotal += amount;
                        summaryGrandTotalQuantity += quantity;
                        return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} `;
                    }),
                    row.totalAmount === 0 && row.totalQuantity === 0 ? "-" : `${formatNumber(row.totalAmount)} `
                ];

                const rowHeight = Math.max(
                    ...values.map((val, j) => calculateTextHeight(val, adjustedSummaryWidths[j], baseFontSize))
                ) + 8; // Reduced padding

                if (y + rowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;
                    // Redraw headers
                    summaryHeaders.forEach((header, j) => {
                        const x = startX + adjustedSummaryWidths.slice(0, j).reduce((a, b) => a + b, 0);
                        const headerHeight = calculateTextHeight(header, adjustedSummaryWidths[j], baseFontSize) + 10;
                        doc.rect(x, y, adjustedSummaryWidths[j], headerHeight)
                           .fillAndStroke("#f0f0f0", "#000");
                        doc.font("Helvetica-Bold")
                           .fontSize(baseFontSize)
                           .fill("#000")
                           .text(header, x + 5, y + 5, {
                               width: adjustedSummaryWidths[j] - 10,
                               align: j === 0 ? "left" : "center"
                           });
                    });
                    y += calculateTextHeight("Sample", adjustedSummaryWidths[0], baseFontSize) + 10;
                }

                const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
                values.forEach((val, j) => {
                    const x = startX + adjustedSummaryWidths.slice(0, j).reduce((a, b) => a + b, 0);
                    const cellColor = isTotalAmountColumn(j, summaryHeaders.length - 1) ? "#d9edf7" : rowColor;
                    doc.rect(x, y, adjustedSummaryWidths[j], rowHeight)
                       .fillAndStroke(cellColor, "#000");
                    doc.font("Helvetica")
                       .fontSize(baseFontSize)
                       .fill("#000")
                       .text(val, x + 5, y + 5, {
                           width: adjustedSummaryWidths[j] - 10,
                           align: j === 0 ? "left" : "right"
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
                    return amount === 0 && quantity === 0 ? "-" : `${formatNumber(amount)} `;
                }),
                summaryGrandTotal === 0 && summaryGrandTotalQuantity === 0 ? "-" : `${formatNumber(summaryGrandTotal)} `
            ];

            const totalRowHeight = Math.max(
                ...summaryTotalRow.map((val, i) => calculateTextHeight(val, adjustedSummaryWidths[i], baseFontSize))
            ) + 10;

            if (y + totalRowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.page.margins.top;
            }

            summaryTotalRow.forEach((val, i) => {
                const x = startX + adjustedSummaryWidths.slice(0, i).reduce((a, b) => a + b, 0);
                doc.rect(x, y, adjustedSummaryWidths[i], totalRowHeight)
                   .fillAndStroke("#d9edf7", "#000");
                doc.font("Helvetica-Bold")
                   .fontSize(baseFontSize)
                   .fill("#000")
                   .text(val, x + 5, y + 5, {
                       width: adjustedSummaryWidths[i] -7,
                       align: i === 0 ? "left" : "right"
                   });
            });

            y += totalRowHeight + 20;

            // Second Table - Product Breakdown
            const productHeaders = ["Product Name", ...monthNames, "Total Amount"];
            const productColumnWidths = calculateColumnWidths(productHeaders, 
                Object.values(distributorData).flatMap(row => [row]));

            const adjustedProductWidths = adjustColumnWidths(productColumnWidths);

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

                const sectionWidth = adjustedProductWidths.reduce((a, b) => a + b, 0);
                doc.rect(startX, y, sectionWidth, 20)
                   .stroke("#000");
                
                doc.font("Helvetica-Bold")
                   .fontSize(baseFontSize)
                   .fill("#000")
                   .text(sectionHeader, startX + 5, y + 5, {
                       width: sectionWidth - 10,
                       align: "left"
                   });

                y += 20;

                // Draw product table headers
                if (y + 40 > PAGE_HEIGHT -  doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;
                }

                productHeaders.forEach((header, i) => {
                    const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    const headerHeight = calculateTextHeight(header, adjustedProductWidths[i], baseFontSize) + 10;
                    
                    doc.rect(x, y, adjustedProductWidths[i], headerHeight)
                       .fillAndStroke("#f0f0f0", "#000");
                    
                    doc.font("Helvetica-Bold")
                       .fontSize(baseFontSize)
                       .fill("#000")
                       .text(header, x + 5, y + 5, {
                           width: adjustedProductWidths[i] - 10,
                           align: i === 0 ? "left" : "right"
                       });
                });

                y += calculateTextHeight("Sample", adjustedProductWidths[0], baseFontSize) + 10;

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
                        ...values.map((val, i) => calculateTextHeight(val, adjustedProductWidths[i], baseFontSize))
                    ) + 10;

                    if (y + rowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
                        doc.addPage();
                        y = doc.page.margins.top;
                        // Redraw headers
                        productHeaders.forEach((header, i) => {
                            const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
                            const headerHeight = calculateTextHeight(header, adjustedProductWidths[i], baseFontSize) + 10;
                            doc.rect(x, y, adjustedProductWidths[i], headerHeight)
                               .fillAndStroke("#f0f0f0", "#000");
                            doc.font("Helvetica-Bold")
                               .fontSize(baseFontSize)
                               .fill("#000")
                               .text(header, x + 5, y + 5, {
                                   width: adjustedProductWidths[i] - 10,
                                   align: i === 0 ? "left" : "right"
                               });
                        });
                        y += calculateTextHeight("Sample", adjustedProductWidths[0], baseFontSize) + 10;
                    }

                    const rowColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
                    values.forEach((val, i) => {
                        const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
                        const cellColor = isTotalAmountColumn(i, productHeaders.length - 1) ? "#d9edf7" : rowColor;
                        doc.rect(x, y, adjustedProductWidths[i], rowHeight)
                           .fillAndStroke(cellColor, "#000");
                        doc.font("Helvetica")
                           .fontSize(baseFontSize)
                           .fill("#000")
                           .text(val, x + 5, y + 5, {
                               width: adjustedProductWidths[i] - 7,
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
                    ...productTotalRow.map((val, i) => calculateTextHeight(val, adjustedProductWidths[i], baseFontSize))
                ) + 8;

                if (y + productTotalRowHeight > PAGE_HEIGHT - doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;
                }

                productTotalRow.forEach((val, i) => {
                    const x = startX + adjustedProductWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    doc.rect(x, y, adjustedProductWidths[i], productTotalRowHeight)
                       .fillAndStroke("#d9edf7", "#000");
                    doc.font("Helvetica-Bold")
                       .fontSize(baseFontSize)
                       .fill("#000")
                       .text(val, x + 5, y + 5, {
                           width: adjustedProductWidths[i] - 7,
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


