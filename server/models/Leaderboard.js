import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  mode: { type: String, default: 'timeAttack' }
}, { timestamps: true });

const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
