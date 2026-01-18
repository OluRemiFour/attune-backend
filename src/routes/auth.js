const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// GET Google Auth URL
router.get('/gmail/connect', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ url });
});

// Gmail Callback
router.get('/gmail/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Upsert user
    let user = await User.findOne({ email: userInfo.data.email });
    if (!user) {
      user = new User({
        email: userInfo.data.email,
        name: userInfo.data.name
      });
    }

    user.gmailAccessToken = tokens.access_token;
    user.gmailRefreshToken = tokens.refresh_token || user.gmailRefreshToken;
    user.tokenExpiry = new Date(tokens.expiry_date);
    await user.save();

    res.send('Successfully connected! You can close this window.');
  } catch (error) {
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

module.exports = router;
