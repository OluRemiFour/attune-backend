const mongoose = require('mongoose');

const AgentDecisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentName: { type: String, required: true },
  inputSnapshot: { type: Object }, // Snapshot of context used
  decision: { type: String, required: true },
  reasoningSummary: { type: String },
  confidence: { type: Number },
  outcome: { type: String }, // User reaction or auto-action result
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentDecision', AgentDecisionSchema);
