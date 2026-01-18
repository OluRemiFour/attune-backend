const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const AgentDecision = require('../models/AgentDecision');

router.post('/email/analyze', async (req, res) => {
  res.json({ message: 'Email analysis triggered' });
});

router.post('/feedback', async (req, res) => {
  try {
    const { emailId, action, reclassification } = req.body;
    
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: 'Email not found' });

    email.userFeedback = {
      action,
      timestamp: new Date()
    };

    if (reclassification) {
      email.analysis.category = reclassification;
    }

    await email.save();

    // Update the corresponding agent decision outcome
    await AgentDecision.findOneAndUpdate(
      { userId: email.userId, 'inputSnapshot.emailSubject': email.subject },
      { outcome: action },
      { sort: { timestamp: -1 } }
    );

    res.json({ success: true, message: 'Feedback stored & learning loop triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
