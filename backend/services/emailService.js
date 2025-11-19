const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, type = 'verification') => {
  try {
    let subject, html;
    
    if (type === 'verification') {
      subject = 'Verify Your Email - OTP Code';
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this verification, please ignore this email.</p>
        </div>
      `;
    } else if (type === 'login') {
      subject = 'Your Login OTP Code';
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login Verification</h2>
          <p>Use the following OTP to complete your login:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't attempt to log in, please secure your account immediately.</p>
        </div>
      `;
    } else {
      subject = 'Your OTP Code';
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        </div>
      `;
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: subject,
      html: html
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to Our App!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome${name ? ', ' + name : ''}!</h2>
          <p>Your account has been successfully verified.</p>
          <p>You can now access all features of our application.</p>
          <p style="color: #666; margin-top: 30px;">Thank you for joining us!</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};