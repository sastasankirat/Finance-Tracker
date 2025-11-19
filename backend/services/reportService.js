const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Resend } = require('resend');
const { getUserTransactions } = require('../models/transactionModel');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate monthly report for a user
 * @param {string} userId - User ID
 * @param {Date} startDate - Start of month
 * @param {Date} endDate - End of month
 * @returns {Promise<Object>} Report data with AI analysis
 */
const generateMonthlyReport = async (userId, startDate = null, endDate = null) => {
  try {
    // Default to current month if dates not provided
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch transactions for the period
    const transactions = await getUserTransactions(userId, {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      limit: 1000
    });

    // Calculate summary
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
      incomeByCategory: {},
      expenseByCategory: {},
      dailyExpenses: {}
    };

    // Process transactions
    transactions.forEach(tx => {
      const amount = tx.amount;
      const category = tx.category;
      const date = new Date(tx.date).toLocaleDateString();

      if (tx.type === 'income') {
        summary.totalIncome += amount;
        summary.incomeCount += 1;
        summary.incomeByCategory[category] = (summary.incomeByCategory[category] || 0) + amount;
      } else {
        summary.totalExpense += amount;
        summary.expenseCount += 1;
        summary.expenseByCategory[category] = (summary.expenseByCategory[category] || 0) + amount;
        summary.dailyExpenses[date] = (summary.dailyExpenses[date] || 0) + amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    // Get AI analysis
    const analysis = await getAIAnalysis(summary, transactions);

    return {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        month: start.toLocaleString('default', { month: 'long', year: 'numeric' })
      },
      summary,
      transactions,
      analysis
    };
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
};

/**
 * Get AI analysis - generated locally without requiring API
 * @param {Object} summary - Transaction summary
 * @param {Array} transactions - All transactions
 * @returns {Promise<Object>} AI analysis with recommendations
 */
const getAIAnalysis = async (summary, transactions) => {
  try {
    // Calculate financial metrics
    const expenseRatio = summary.totalIncome > 0 ? (summary.totalExpense / summary.totalIncome) * 100 : 0;
    const savingsRatio = 100 - expenseRatio;
    const spendingScore = calculateSpendingScore(summary);
    
    // Find top spending categories
    const topCategories = Object.entries(summary.expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amt]) => `${cat} (₹${amt})`);

    // Generate insights based on financial data
    let overview = `Financial Overview: `;
    
    if (savingsRatio >= 30) {
      overview += `Excellent! You're maintaining a healthy savings rate of ${savingsRatio.toFixed(1)}%. Your income (₹${summary.totalIncome}) exceeds your expenses (₹${summary.totalExpense}), putting you in a strong financial position.`;
    } else if (savingsRatio >= 10) {
      overview += `Good! You're saving ${savingsRatio.toFixed(1)}% of your income. With ₹${summary.totalIncome} earned and ₹${summary.totalExpense} spent, you have a reasonable financial cushion.`;
    } else if (savingsRatio >= 0) {
      overview += `Moderate. You're saving ${savingsRatio.toFixed(1)}% of your income. Consider optimizing your expenses to increase savings.`;
    } else {
      overview += `Alert! Your expenses (₹${summary.totalExpense}) exceed your income (₹${summary.totalIncome}) by ₹${Math.abs(summary.balance)}. Immediate expense reduction needed.`;
    }

    // Key observations
    const observations = [];
    observations.push(`📊 Expense Ratio: ${expenseRatio.toFixed(1)}% of income spent`);
    
    if (topCategories.length > 0) {
      observations.push(`💰 Top Spending: ${topCategories.join(', ')}`);
    }
    
    if (summary.expenseCount > 0) {
      const avgExpense = Math.round(summary.totalExpense / summary.expenseCount);
      observations.push(`📈 Average Expense per Transaction: ₹${avgExpense}`);
    }
    
    if (expenseRatio > 80) {
      observations.push(`⚠️  High Expense Ratio: You're spending over 80% of income`);
    }

    // Recommendations
    const recommendations = [];
    if (expenseRatio > 70) {
      recommendations.push(`Reduce discretionary spending - Consider cutting back on non-essential categories`);
    }
    if (summary.expenseByCategory['Entertainment'] > summary.totalExpense * 0.15) {
      recommendations.push(`Entertainment costs are high - Review subscriptions and entertainment expenses`);
    }
    if (summary.expenseByCategory['Shopping'] > summary.totalExpense * 0.2) {
      recommendations.push(`Shopping expenses are significant - Set daily/weekly limits and use shopping lists`);
    }
    if (savingsRatio < 20) {
      recommendations.push(`Increase savings rate - Aim for at least 20% savings per month`);
    } else {
      recommendations.push(`Maintain your disciplined spending - Your financial habits are sound`);
    }
    recommendations.push(`Review expenses monthly to identify trends and optimization opportunities`);

    // Risk assessment
    let riskLevel = 'Low';
    let riskDetails = 'Your finances are stable.';
    
    if (savingsRatio < 0) {
      riskLevel = 'Critical';
      riskDetails = 'You are spending more than earning - immediate action required.';
    } else if (expenseRatio > 90) {
      riskLevel = 'High';
      riskDetails = 'You have very little financial cushion - build an emergency fund.';
    } else if (expenseRatio > 70) {
      riskLevel = 'Moderate';
      riskDetails = 'Consider building a larger emergency fund and reducing expenses.';
    }

    const analysis = `
📋 KEY OBSERVATIONS:
${observations.map(o => `• ${o}`).join('\n')}

💡 RECOMMENDATIONS:
${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

⚠️ RISK ASSESSMENT:
• Level: ${riskLevel}
• Details: ${riskDetails}
`;

    return {
      overview: `${overview}\n${analysis}`,
      spendingScore: spendingScore,
      savingsPercentage: savingsRatio,
      avgDailyExpense: summary.expenseCount > 0 
        ? Math.round(summary.totalExpense / summary.expenseCount) 
        : 0
    };
  } catch (error) {
    console.error('Error getting AI analysis:', error);
    throw error;
  }
};

/**
 * Calculate spending score (0-100, higher is better)
 */
const calculateSpendingScore = (summary) => {
  if (summary.totalIncome === 0) return 0;

  const savingsRatio = summary.balance / summary.totalIncome;
  
  // Score: 0-100 based on savings ratio
  // 30% savings = 100, 0% = 0, -10% = lower
  let score = Math.min(100, Math.max(0, (savingsRatio + 0.1) * 100 / 0.4));
  
  return Math.round(score);
};

/**
 * Generate HTML email template for report
 */
const generateReportHTML = (reportData, userName) => {
  const { period, summary, analysis } = reportData;

  const expenseCategories = Object.entries(summary.expenseByCategory)
    .map(([cat, amt]) => `<li><strong>${cat}:</strong> ₹${amt.toFixed(2)}</li>`)
    .join('');

  const incomeCategories = Object.entries(summary.incomeByCategory)
    .map(([cat, amt]) => `<li><strong>${cat}:</strong> ₹${amt.toFixed(2)}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .section { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .metric { display: inline-block; width: 48%; margin-right: 2%; text-align: center; padding: 15px; background: #f0f0f0; border-radius: 5px; margin-bottom: 10px; }
        .metric.last { margin-right: 0; }
        .metric-value { font-size: 28px; font-weight: bold; color: #667eea; }
        .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
        .positive { color: #27ae60; }
        .negative { color: #e74c3c; }
        .category-list { list-style: none; padding: 0; }
        .category-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .category-list li:last-child { border-bottom: none; }
        .score { font-size: 48px; font-weight: bold; color: #667eea; }
        .analysis { white-space: pre-line; line-height: 1.8; }
        .footer { background: #333; color: white; text-align: center; padding: 20px; border-radius: 0 0 10px 10px; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Monthly Financial Report</h1>
          <p>${period.month}</p>
        </div>

        <div class="section">
          <h2>Hello ${userName}! 👋</h2>
          <p>Here's your financial summary for ${period.month}.</p>
        </div>

        <div class="section">
          <h3>📊 Summary Metrics</h3>
          <div class="metric">
            <div class="metric-label">Total Income</div>
            <div class="metric-value positive">₹${summary.totalIncome.toFixed(2)}</div>
          </div>
          <div class="metric last">
            <div class="metric-label">Total Expense</div>
            <div class="metric-value negative">₹${summary.totalExpense.toFixed(2)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Net Balance</div>
            <div class="metric-value ${summary.balance >= 0 ? 'positive' : 'negative'}">₹${summary.balance.toFixed(2)}</div>
          </div>
          <div class="metric last">
            <div class="metric-label">Savings Rate</div>
            <div class="metric-value">${analysis.savingsPercentage}%</div>
          </div>
        </div>

        <div class="section">
          <h3>💵 Income Breakdown</h3>
          ${incomeCategories ? `<ul class="category-list">${incomeCategories}</ul>` : '<p>No income recorded this month</p>'}
        </div>

        <div class="section">
          <h3>💸 Expense Breakdown</h3>
          ${expenseCategories ? `<ul class="category-list">${expenseCategories}</ul>` : '<p>No expenses recorded this month</p>'}
        </div>

        <div class="section">
          <h3>🎯 Financial Health Score</h3>
          <div style="text-align: center;">
            <div class="score">${analysis.spendingScore}/100</div>
            <p>${getHealthScoreMessage(analysis.spendingScore)}</p>
          </div>
        </div>

        <div class="section">
          <h3>🤖 AI Analysis & Recommendations</h3>
          <div class="analysis">${escapeHtml(analysis.overview)}</div>
        </div>

        <div class="section">
          <p style="margin-bottom: 0; font-size: 12px; color: #666;">
            Report generated on ${new Date().toLocaleDateString()} for period: ${period.start} to ${period.end}
          </p>
        </div>

        <div class="footer">
          <p>Finance Tracker - Smart Financial Management</p>
          <p>This is an automated monthly report. Please don't reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Get health score message
 */
const getHealthScoreMessage = (score) => {
  if (score >= 80) return 'Excellent! Your financial health is great! 🌟';
  if (score >= 60) return 'Good! You\'re managing well, but room for improvement 👍';
  if (score >= 40) return 'Fair. Focus on reducing expenses and increasing savings 📈';
  return 'Needs attention. Consider reviewing your spending habits 🔍';
};

/**
 * Escape HTML to prevent injection
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Send report via email
 */
const sendReportEmail = async (userEmail, userName, reportData) => {
  try {
    const htmlContent = generateReportHTML(reportData, userName);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: userEmail,
      subject: `Your Monthly Financial Report - ${reportData.period.month}`,
      html: htmlContent
    });

    console.log('Report email sent:', result.id);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending report email:', error);
    throw error;
  }
};

module.exports = {
  generateMonthlyReport,
  sendReportEmail,
  getAIAnalysis,
  calculateSpendingScore
};
