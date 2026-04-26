const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  original:    { type: String, required: true },
  simplified:  { type: String, required: true },
  riskLevel:   { type: String, enum: ['safe', 'warning', 'danger'], default: 'safe' },
  riskReason:  { type: String, default: '' }
});

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: { type: String, required: true },
  documentType: {
    type: String,
    enum: ['rental', 'employment', 'loan', 'nda', 'service', 'other'],
    default: 'other'
  },
  language: {
    type: String,
    enum: ['english','hindi','kannada','tamil','telugu','malayalam','marathi','bengali'],
    default: 'english'
  },
  rawText:        { type: String, required: true },
  summary:        { type: String, default: '' },
  clauses:        [clauseSchema],
  pageCount:      { type: Number, default: 1 },
  wordCount:      { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  errorMessage:   { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);