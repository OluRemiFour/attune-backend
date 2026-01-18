const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gmailAccessToken: { type: String },
  gmailRefreshToken: { type: String },
  tokenExpiry: { type: Date },
  focusPreferences: {
    workHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
