const { google } = require('googleapis');
const User = require('../models/User');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
  }

  async fetchUnreadEmails(user) {
    this.oauth2Client.setCredentials({
      refresh_token: user.gmailRefreshToken,
      access_token: user.gmailAccessToken
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    try {
      const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 10
      });

      const messages = res.data.messages || [];
      const emailDetails = await Promise.all(
        messages.map(async (msg) => {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id
          });
          return this.normalizeEmail(detail.data, user._id);
        })
      );

      return emailDetails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  normalizeEmail(gmailData, userId) {
    const headers = gmailData.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
    
    // Simple body extraction (can be improved)
    let body = '';
    if (gmailData.snippet) {
      body = gmailData.snippet;
    }

    return {
      userId,
      gmailId: gmailData.id,
      threadId: gmailData.threadId,
      from,
      subject,
      body,
      receivedAt: new Date(parseInt(gmailData.internalDate))
    };
  }
}

module.exports = new GmailService();
