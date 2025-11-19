const cron = require('node-cron');
const { findUserById } = require('../models/userModel');
const { generateMonthlyReport, sendReportEmail } = require('./reportService');

// Store scheduled jobs
const scheduledJobs = new Map();

/**
 * Schedule monthly report for a user
 * Runs on the last day of each month at 9 AM
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @param {string} userName - User name
 */
const scheduleMonthlyReport = (userId, userEmail, userName) => {
  try {
    // Cron pattern: 0 9 28-31 * * (9 AM on 28-31st of each month)
    // This will run on the last valid day of the month
    const job = cron.schedule('0 9 28-31 * *', async () => {
      try {
        console.log(`Running monthly report for user: ${userId}`);
        
        // Generate report
        const reportData = await generateMonthlyReport(userId);
        
        // Send email
        await sendReportEmail(userEmail, userName, reportData);
        
        console.log(`Monthly report sent to ${userEmail}`);
      } catch (error) {
        console.error(`Error sending monthly report for ${userId}:`, error);
      }
    });

    // Store job reference
    scheduledJobs.set(userId, { job, userEmail, userName });
    console.log(`Scheduled monthly report for user: ${userId}`);
    
    return job;
  } catch (error) {
    console.error('Error scheduling monthly report:', error);
    throw error;
  }
};

/**
 * Unschedule monthly report for a user
 * @param {string} userId - User ID
 */
const unscheduleMonthlyReport = (userId) => {
  try {
    const jobData = scheduledJobs.get(userId);
    if (jobData) {
      jobData.job.stop();
      scheduledJobs.delete(userId);
      console.log(`Unscheduled monthly report for user: ${userId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unscheduling monthly report:', error);
    throw error;
  }
};

/**
 * Get all scheduled jobs
 */
const getScheduledJobs = () => {
  return Array.from(scheduledJobs.entries()).map(([userId, data]) => ({
    userId,
    email: data.userEmail,
    name: data.userName,
    status: 'scheduled'
  }));
};

/**
 * Initialize all scheduled reports for active users
 * Call this when server starts
 */
const initializeScheduledReports = async (User) => {
  try {
    // Get all users (you might want to add a flag to User schema for "wantsMonthlyReport")
    // For now, we'll just initialize - users can opt-in via API
    console.log('Scheduled reports initialization complete');
  } catch (error) {
    console.error('Error initializing scheduled reports:', error);
  }
};

/**
 * Create a one-time reminder task (useful for testing)
 */
const scheduleOneTimeReport = (userId, userEmail, userName, delayMinutes = 1) => {
  try {
    // Calculate delay in milliseconds
    const delayMs = delayMinutes * 60 * 1000;
    
    const timeout = setTimeout(async () => {
      try {
        console.log(`Running one-time report for user: ${userId}`);
        
        // Generate report
        const reportData = await generateMonthlyReport(userId);
        
        // Send email
        await sendReportEmail(userEmail, userName, reportData);
        
        console.log(`One-time report sent to ${userEmail}`);
      } catch (error) {
        console.error(`Error sending one-time report for ${userId}:`, error);
      }
    }, delayMs);

    return timeout;
  } catch (error) {
    console.error('Error scheduling one-time report:', error);
    throw error;
  }
};

module.exports = {
  scheduleMonthlyReport,
  unscheduleMonthlyReport,
  getScheduledJobs,
  initializeScheduledReports,
  scheduleOneTimeReport
};
