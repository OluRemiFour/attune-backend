const express = require('express');
const router = express.Router();
const Email = require('../models/Email');

// GET unread emails
router.get('/fetch', async (req, res) => {
  try {
    const { userId } = req.query;
    const emails = await Email.find({ userId, processed: false });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
