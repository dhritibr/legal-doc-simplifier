const router = require('express').Router();
const authMiddleware = require('../../middleware/auth.middleware');
const { uploadLimiter } = require('../../middleware/rateLimit.middleware');
const {
  uploadDocument,
  analyseDocument,
  getMyDocuments,
  getDocumentById,
  deleteDocument
} = require('./document.controller');

router.post('/',             authMiddleware, uploadLimiter, uploadDocument);
router.post('/:id/analyse',  authMiddleware, analyseDocument);
router.get('/',              authMiddleware, getMyDocuments);
router.get('/:id',           authMiddleware, getDocumentById);
router.delete('/:id',        authMiddleware, deleteDocument);

module.exports = router;