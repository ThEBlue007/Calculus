const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  mode: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
