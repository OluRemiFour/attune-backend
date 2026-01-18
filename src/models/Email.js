const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  threadId: { type: String, required: true },
  gmailId: { type: String, required: true, unique: true },
  from: { type: String },
  subject: { type: String },
  body: { type: String },
  receivedAt: { type: Date },
  processed: { type: Boolean, default: false },
  analysis: {
    priority: { type: Number }, // 0-100
    category: { type: String },
    reasoning: { type: String },
    suggestedAction: { type: String },
    confidence: { type: Number }
  },
  userFeedback: {
    action: { type: String, enum: ['opened', 'dismissed', 'ignored', 'reclassified'] },
    timestamp: { type: Date }
  }
});

module.exports = mongoose.model('Email', EmailSchema);
