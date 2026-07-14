const mongoose = require('mongoose');

const activeQuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true, unique: true },
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
  math: { type: String },
  options: { type: Array },
  type: { type: String },
  twinData: { type: Object },
  createdAt: { type: Date, expires: '2m', default: Date.now }
});

module.exports = mongoose.model('ActiveQuestion', activeQuestionSchema);
