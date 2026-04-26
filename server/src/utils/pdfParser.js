const pdfreader = require('pdfreader');
const fs = require('fs');

const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = {};
    let currentPage = 1;
    let pageCount = 0;

    new pdfreader.PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(new Error(`PDF parsing failed: ${err.message}`));
        return;
      }

      if (!item) {
        const text = Object.keys(rows)
          .sort((a, b) => a - b)
          .map(y => rows[y].join(' '))
          .join('\n');

        if (!text || text.trim().length < 50) {
          reject(new Error('PDF appears to be empty or scanned image — text extraction failed'));
          return;
        }

        resolve({
          text:      text.trim(),
          pages:     pageCount,
          wordCount: text.trim().split(/\s+/).length
        });
        return;
      }

      if (item.page) {
        currentPage = item.page;
        pageCount   = Math.max(pageCount, item.page);
      }

      if (item.text) {
        const y = `${currentPage}_${item.y}`;
        if (!rows[y]) rows[y] = [];
        rows[y].push(item.text);
      }
    });
  });
};

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('File deletion error:', err.message);
  }
};

module.exports = { extractTextFromPDF, deleteFile };