const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Asset = require('../models/Asset');

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

// Helper function to get current date formatted
const getCurrentDate = () => {
  const now = new Date();
  return `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
};

// Helper function to build filter object
const buildFilter = (query) => {
  const { condition, category, startDate, endDate, search } = query;
  
  const filter = {};
  
  if (condition) filter.condition = condition;
  if (category) filter.category = category;
  
  // Date range filter
  if (startDate || endDate) {
    filter.acquisitionDate = {};
    if (startDate) filter.acquisitionDate.$gte = new Date(startDate);
    if (endDate) filter.acquisitionDate.$lte = new Date(endDate);
  }
  
  // Search by name, owner, or description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { owner: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  return filter;
};

// Generate PDF report
router.get('/pdf', async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const assets = await Asset.find(filter).sort({ name: 1 });
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SIA-JKT-${getCurrentDate()}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Laporan Inventaris Aset JKT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tanggal Laporan: ${getCurrentDate()}`, { align: 'center' });
    doc.moveDown();
    
    // Add filter information if any
    if (req.query.startDate || req.query.endDate) {
      let dateRange = 'Periode: ';
      if (req.query.startDate) dateRange += `${formatDate(req.query.startDate)} `;
      dateRange += 'sampai ';
      if (req.query.endDate) dateRange += formatDate(req.query.endDate);
      else dateRange += 'sekarang';
      
      doc.fontSize(10).text(dateRange, { align: 'center' });
      doc.moveDown();
    }
    
    if (req.query.condition) {
      doc.fontSize(10).text(`Kondisi: ${req.query.condition}`, { align: 'center' });
      doc.moveDown();
    }
    
    if (req.query.category) {
      doc.fontSize(10).text(`Kategori: ${req.query.category}`, { align: 'center' });
      doc.moveDown();
    }
    
    // Table header
    doc.fontSize(10);
    const tableTop = doc.y + 20;
    const tableHeaders = ['No', 'Nama Aset', 'Pemilik', 'Kategori', 'Tanggal Perolehan', 'Kondisi'];
    const columnWidths = [30, 120, 100, 80, 100, 80];
    
    let currentY = tableTop;
    
    // Draw headers
    doc.font('Helvetica-Bold');
    let currentX = 50;
    
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, currentY, { width: columnWidths[i], align: 'left' });
      currentX += columnWidths[i];
    });
    
    doc.font('Helvetica');
    currentY += 20;
    
    // Draw rows
    assets.forEach((asset, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
        
        // Redraw headers on new page
        doc.font('Helvetica-Bold');
        currentX = 50;
        
        tableHeaders.forEach((header, i) => {
          doc.text(header, currentX, currentY, { width: columnWidths[i], align: 'left' });
          currentX += columnWidths[i];
        });
        
        doc.font('Helvetica');
        currentY += 20;
      }
      
      // Draw row
      currentX = 50;
      
      // No
      doc.text(index + 1, currentX, currentY, { width: columnWidths[0], align: 'left' });
      currentX += columnWidths[0];
      
      // Name
      doc.text(asset.name, currentX, currentY, { width: columnWidths[1], align: 'left' });
      currentX += columnWidths[1];
      
      // Owner
      doc.text(asset.owner, currentX, currentY, { width: columnWidths[2], align: 'left' });
      currentX += columnWidths[2];
      
      // Category
      doc.text(asset.category, currentX, currentY, { width: columnWidths[3], align: 'left' });
      currentX += columnWidths[3];
      
      // Acquisition Date
      doc.text(formatDate(asset.acquisitionDate), currentX, currentY, { width: columnWidths[4], align: 'left' });
      currentX += columnWidths[4];
      
      // Condition
      doc.text(asset.condition, currentX, currentY, { width: columnWidths[5], align: 'left' });
      
      currentY += 20;
    });
    
    // Summary
    doc.moveDown(2);
    doc.fontSize(10).text(`Total Aset: ${assets.length}`, { align: 'right' });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Excel report
router.get('/excel', async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const assets = await Asset.find(filter).sort({ name: 1 });
    
    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventaris Aset');
    
    // Add title
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'LAPORAN INVENTARIS ASET JKT';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Add date
    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Tanggal Laporan: ${getCurrentDate()}`;
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Add filter information if any
    let rowIndex = 3;
    
    if (req.query.startDate || req.query.endDate) {
      worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
      let dateRange = 'Periode: ';
      if (req.query.startDate) dateRange += `${formatDate(req.query.startDate)} `;
      dateRange += 'sampai ';
      if (req.query.endDate) dateRange += formatDate(req.query.endDate);
      else dateRange += 'sekarang';
      
      worksheet.getCell(`A${rowIndex}`).value = dateRange;
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
      rowIndex++;
    }
    
    if (req.query.condition) {
      worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
      worksheet.getCell(`A${rowIndex}`).value = `Kondisi: ${req.query.condition}`;
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
      rowIndex++;
    }
    
    if (req.query.category) {
      worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
      worksheet.getCell(`A${rowIndex}`).value = `Kategori: ${req.query.category}`;
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
      rowIndex++;
    }
    
    rowIndex++; // Add space before table
    
    // Define columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Aset', key: 'name', width: 30 },
      { header: 'Pemilik', key: 'owner', width: 20 },
      { header: 'Kategori', key: 'category', width: 15 },
      { header: 'Tanggal Perolehan', key: 'acquisitionDate', width: 20 },
      { header: 'Kondisi', key: 'condition', width: 15 }
    ];
    
    // Style the header row
    worksheet.getRow(rowIndex).font = { bold: true };
    worksheet.getRow(rowIndex).alignment = { horizontal: 'center' };
    
    // Add data rows
    assets.forEach((asset, index) => {
      worksheet.addRow({
        no: index + 1,
        name: asset.name,
        owner: asset.owner,
        category: asset.category,
        acquisitionDate: formatDate(asset.acquisitionDate),
        condition: asset.condition
      });
    });
    
    // Add total row
    const totalRow = worksheet.addRow({
      name: `Total Aset: ${assets.length}`
    });
    totalRow.font = { bold: true };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=SIA-JKT-${getCurrentDate()}.xlsx`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;