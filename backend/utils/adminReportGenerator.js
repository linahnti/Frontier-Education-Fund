const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateDonationPDF = (data) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    
    // Build PDF content
    doc.fontSize(16).text('Donation Report', { align: 'center' });
    doc.moveDown();
    
    data.forEach((donation, index) => {
      doc.fontSize(12)
        .text(`${index + 1}. ${donation.donorId?.name || 'Anonymous'} donated ` +
          `${donation.type === 'money' ? `KES ${donation.amount}` : donation.items.join(', ')} ` +
          `to ${donation.schoolId?.schoolName || 'N/A'} on ` +
          `${new Date(donation.createdAt).toLocaleDateString()}`);
      doc.moveDown(0.5);
    });
    
    doc.end();
  });
};