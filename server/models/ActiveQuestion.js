import mongoose from 'mongoose';

const activeQuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true, unique: true },
  correctIndex: { type: Number, required: true },
  twinData: { type: Object, default: null }, // for twin boss phase 2 correct index
  expiresAt: { type: Date, default: Date.now, expires: '2m' } // Auto delete after 2 mins
});

const ActiveQuestion = mongoose.models.ActiveQuestion || mongoose.model('ActiveQuestion', activeQuestionSchema);
export default ActiveQuestion;
