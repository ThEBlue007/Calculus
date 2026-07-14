import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  drachmas: { type: Number, default: 0 },
  upgrades: { type: Object, default: { hermes: 0, chronos: 0, athena: 0 } },
  relics: { type: Array, default: [] }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
