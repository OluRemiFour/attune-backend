const cron = require('node-cron');
const GmailService = require('../services/gmailService');
const LLMService = require('../services/llmService');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');
const Email = require('../models/Email');
const Goal = require('../models/Goal');

// Every 5 minutes (simplified for MVP)
const startEmailPolling = () => {
  console.log('Starting email polling worker...');
  
  cron.schedule('* * * * *', async () => {
    console.log('Polling for new emails...');
    const users = await User.find({ gmailRefreshToken: { $exists: true } });

    for (const user of users) {
      try {
        const rawEmails = await GmailService.fetchUnreadEmails(user);
        
        for (const emailData of rawEmails) {
          const exists = await Email.findOne({ gmailId: emailData.gmailId });
          if (exists) continue;

          const goals = await Goal.find({ userId: user._id, status: 'active' });
          
          const analysis = await LLMService.analyzeEmail({
            email: emailData,
            userContext: { goals },
            historicalSignals: []
          });

          const newEmail = new Email({
            ...emailData,
            analysis,
            processed: true
          });
          await newEmail.save();

          // Send notification if priority is high
          await NotificationService.sendBrowserPush(user, emailData, analysis);
          
          console.log(`Processed email: ${emailData.subject} (Priority: ${analysis.priority})`);
        }
      } catch (error) {
        console.error(`Error polling for user ${user.email}:`, error);
      }
    }
  });
};

module.exports = { startEmailPolling };
