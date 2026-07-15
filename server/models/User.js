const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  drachmas: { type: Number, default: 0 },
  upgrades: { type: Object, default: { hermes: 0, chronos: 0, athena: 0, lhopital: 0 } },
  relics: { type: Array, default: [] },
  equippedRelics: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
