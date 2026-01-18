class NotificationService {
  async sendBrowserPush(user, email, analysis) {
    if (analysis.category !== 'immediate') {
      console.log(`Notification suppressed for ${email.subject} (Category: ${analysis.category})`);
      return;
    }

    // Check work hours & focus state (simplified)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [startHour, startMin] = user.focusPreferences.workHours.start.split(':').map(Number);
    const [endHour, endMin] = user.focusPreferences.workHours.end.split(':').map(Number);

    const isAfterStart = currentHour > startHour || (currentHour === startHour && currentMinute >= startMin);
    const isBeforeEnd = currentHour < endHour || (currentHour === endHour && currentMinute <= endMin);

    if (isAfterStart && isBeforeEnd) {
      console.log(`POW! Sending browser push to ${user.name}: Important Email - ${email.subject}`);
      // Actual implementation would use web-push or socket.io
    } else {
      console.log(`Notification delayed for ${user.name}: Outside work hours.`);
    }
  }
}

module.exports = new NotificationService();
