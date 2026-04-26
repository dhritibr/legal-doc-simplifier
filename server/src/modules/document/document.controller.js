const path = require('path');
const multer = require('multer');
const Document = require('./document.model');
const User = require('../auth/auth.model');
const { extractTextFromPDF, deleteFile } = require('../../utils/pdfParser');
const { success, error } = require('../../utils/responseHelper');
const { processDocument } = require('../gemini/gemini.service');

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../../uploads')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('document');

// upload + process
const uploadDocument = (req, res) => {
  upload(req, res, async (uploadErr) => {
    if (uploadErr instanceof multer.MulterError) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE')
        return error(res, 'File too large — maximum size is 10MB', 400);
      return error(res, uploadErr.message, 400);
    }
    if (uploadErr) return error(res, uploadErr.message, 400);
    if (!req.file)  return error(res, 'Please upload a PDF file', 400);

    const filePath = req.file.path;
    const { language, documentType } = req.body;

    try {
      // extract text from PDF
      const { text, pages, wordCount } = await extractTextFromPDF(filePath);

      // save to MongoDB — no Gemini yet
      const doc = await Document.create({
        userId:           req.user.id,
        originalFileName: req.file.originalname,
        documentType:     documentType || 'other',
        language:         language || 'english',
        rawText:          text,
        pageCount:        pages,
        wordCount:        wordCount,
        status:           'uploaded'   // not processing yet
      });

      try { deleteFile(filePath); } catch (_) {}

      return success(res, {
        documentId:   doc._id,
        originalFileName: doc.originalFileName,
        pageCount:    doc.pageCount,
        wordCount:    doc.wordCount,
        documentType: doc.documentType,
        language:     doc.language,
        status:       doc.status
      }, 'Document uploaded — click Analyse to process', 201);

    } catch (err) {
      try { deleteFile(filePath); } catch (_) {}
      return error(res, err.message);
    }
  });
};

// get all documents for logged in user
const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id })
      .select('-rawText -clauses')
      .sort({ createdAt: -1 });

    return success(res, {
      documents: docs,
      total:     docs.length
    });
  } catch (err) {
    return error(res, err.message);
  }
};

// get single document by id
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:    req.params.id,
      userId: req.user.id
    });

    if (!doc) return error(res, 'Document not found', 404);

    return success(res, doc);
  } catch (err) {
    return error(res, err.message);
  }
};

// delete document
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.id
    });

    if (!doc) return error(res, 'Document not found', 404);

    return success(res, null, 'Document deleted successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

const analyseDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:    req.params.id,
      userId: req.user.id
    });

    if (!doc) return error(res, 'Document not found', 404);

    if (doc.status === 'completed')
      return success(res, {
        documentId: doc._id,
        summary:    doc.summary,
        clauses:    doc.clauses
      }, 'Already analysed');

    if (doc.status === 'processing')
      return error(res, 'Analysis already in progress', 400);

    // mark as processing
    doc.status = 'processing';
    await doc.save();

    try {
      const result = await processDocument(
        doc.rawText,
        doc.language,
        doc.documentType
      );

      doc.summary = result.summary;
      doc.clauses = result.clauses;
      doc.status  = 'completed';
      await doc.save();

      await User.findByIdAndUpdate(req.user.id, {
        $inc: { documentsProcessed: 1 }
      });

      return success(res, {
        documentId: doc._id,
        summary:    doc.summary,
        clauses:    doc.clauses,
        status:     doc.status
      }, 'Analysis complete');

    } catch (err) {
      doc.status       = 'failed';
      doc.errorMessage = err.message;
      await doc.save();
      return error(res, err.message);
    }

  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  uploadDocument,
  analyseDocument,
  getMyDocuments,
  getDocumentById,
  deleteDocument
};
