const express = require('express');
const router = express.Router();
const { findUserByEmail, findUserById } = require('../models/userModel');
const { generateMonthlyReport, sendReportEmail } = require('../services/reportService');
const { 
  scheduleMonthlyReport, 
  unscheduleMonthlyReport, 
  getScheduledJobs,
  scheduleOneTimeReport 
} = require('../services/schedulerService');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

/**
 * Generate and send monthly report immediately
 * POST /api/reports/generate
 */
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    const user = await findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate report
    const reportData = await generateMonthlyReport(req.user._id);

    res.json({ 
      success: true, 
      message: 'Report generated successfully',
      report: {
        period: reportData.period,
        summary: reportData.summary,
        analysis: reportData.analysis,
        transactionCount: reportData.transactions.length
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Generate and send monthly report via email
 * POST /api/reports/send
 */
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const user = await findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'User email not found' 
      });
    }

    // Generate report
    const reportData = await generateMonthlyReport(req.user._id);

    // Send email
    const result = await sendReportEmail(user.email, user.name, reportData);

    res.json({ 
      success: true, 
      message: 'Report sent to email successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get report for a specific date range
 * GET /api/reports/custom?startDate=2024-11-01&endDate=2024-11-30
 */
router.get('/custom', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'startDate and endDate are required' 
      });
    }

    // Generate custom report
    const reportData = await generateMonthlyReport(
      req.user._id,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ 
      success: true,
      report: {
        period: reportData.period,
        summary: reportData.summary,
        analysis: reportData.analysis,
        transactionCount: reportData.transactions.length
      }
    });
  } catch (error) {
    console.error('Error generating custom report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating custom report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Schedule monthly reports for user
 * POST /api/reports/schedule
 */
router.post('/schedule', isAuthenticated, async (req, res) => {
  try {
    const user = await findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Schedule report
    scheduleMonthlyReport(req.user._id.toString(), user.email, user.name);

    res.json({ 
      success: true, 
      message: 'Monthly reports scheduled successfully. You will receive reports on the last day of each month at 9 AM.'
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error scheduling report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Unschedule monthly reports for user
 * POST /api/reports/unschedule
 */
router.post('/unschedule', isAuthenticated, async (req, res) => {
  try {
    const result = unscheduleMonthlyReport(req.user._id.toString());

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'No scheduled reports found for this user' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Monthly reports unscheduled successfully'
    });
  } catch (error) {
    console.error('Error unscheduling report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error unscheduling report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get scheduled jobs (admin only for now)
 * GET /api/reports/scheduled
 */
router.get('/scheduled', isAuthenticated, async (req, res) => {
  try {
    const jobs = getScheduledJobs();
    
    res.json({ 
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error getting scheduled jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching scheduled jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Test: Send report after delay (for testing without waiting for month end)
 * POST /api/reports/test-send?delayMinutes=1
 */
router.post('/test-send', isAuthenticated, async (req, res) => {
  try {
    const { delayMinutes = 1 } = req.query;
    const user = await findUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Schedule one-time report
    scheduleOneTimeReport(req.user._id.toString(), user.email, user.name, parseInt(delayMinutes));

    res.json({ 
      success: true, 
      message: `Test report will be sent to ${user.email} in ${delayMinutes} minute(s).`
    });
  } catch (error) {
    console.error('Error scheduling test report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error scheduling test report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
