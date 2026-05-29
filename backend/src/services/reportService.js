const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { uploadGeneratedFile, safeRemoveLocalFile } = require("./fileStorageService");

const reportDir = path.join(process.cwd(), "uploads", "reports");
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

const generatePdfReport = async ({ title, rows = [], columns = [] }) => {
  const fileName = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  const fullPath = path.join(reportDir, fileName);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(fs.createWriteStream(fullPath));

  doc.fontSize(16).text(title, { underline: true });
  doc.moveDown();

  rows.forEach((row, index) => {
    doc.fontSize(11).text(`${index + 1}.`);
    columns.forEach((col) => {
      doc.fontSize(10).text(`${col.label}: ${row[col.key] ?? "-"}`);
    });
    doc.moveDown(0.5);
  });

  doc.end();

  await new Promise((resolve) => {
    doc.on("end", resolve);
    setTimeout(resolve, 300);
  });

  const uploaded = await uploadGeneratedFile(fullPath, {
    folder: "frms/reports",
    resourceType: "raw",
  });
  if (uploaded.provider === "cloudinary") await safeRemoveLocalFile(fullPath);
  return { fileName, fullPath, fileUrl: uploaded.url };
};

const generateExcelReport = async ({ sheetName, rows = [], columns = [] }) => {
  const fileName = `${Date.now()}-${sheetName.toLowerCase().replace(/\s+/g, "-")}.xlsx`;
  const fullPath = path.join(reportDir, fileName);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: c.width || 25 }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };

  await workbook.xlsx.writeFile(fullPath);
  const uploaded = await uploadGeneratedFile(fullPath, {
    folder: "frms/reports",
    resourceType: "raw",
  });
  if (uploaded.provider === "cloudinary") await safeRemoveLocalFile(fullPath);
  return { fileName, fullPath, fileUrl: uploaded.url };
};

module.exports = { generatePdfReport, generateExcelReport, reportDir };
