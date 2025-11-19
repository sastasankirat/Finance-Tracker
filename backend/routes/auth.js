const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { 
  findUserByEmail, 
  createUser, 
  updateUser, 
  storeOTP, 
  verifyOTP 
} = require('../models/userModel');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      email,
      password: hashedPassword,
      name: name || '',
      isVerified: false,
      authProvider: 'local'
    });

    // Generate and send OTP
    const otp = generateOTP();
    await storeOTP(email, otp, 'verification');
    await sendOTPEmail(email, otp, 'verification');

    res.status(201).json({ 
      success: true, 
      message: 'User created. Please check your email for OTP verification.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user' 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const isValid = await verifyOTP(email, otp, 'verification');

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

  // Update user as verified
  const user = await findUserByEmail(email);
  if (user && user._id) {
    await updateUser(user._id, { isVerified: true });
  }

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    res.json({ 
      success: true, 
      message: 'Email verified successfully. You can now log in.' 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying OTP' 
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already verified' 
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 'verification');
    await sendOTPEmail(email, otp, 'verification');

    res.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending OTP' 
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: info.message || 'Invalid credentials' 
      });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Login error' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Logged in successfully',
        user: {
          id: user._id ? user._id.toString() : user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider
        }
      });
    });
  })(req, res, next);
});

// Login with OTP - Request OTP
router.post('/login-otp/request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 'login');
    await sendOTPEmail(email, otp, 'login');

    res.json({ 
      success: true, 
      message: 'OTP sent to your email' 
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending OTP' 
    });
  }
});

// Login with OTP - Verify OTP
router.post('/login-otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const isValid = await verifyOTP(email, otp, 'login');

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    const user = await findUserByEmail(email);
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Login error' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Logged in successfully',
        user: {
          id: user._id ? user._id.toString() : user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider
        }
      });
    });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying OTP' 
    });
  }
});

// Google OAuth - Initiate
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication - ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_error`);
      }
      // Successful authentication -> redirect to frontend dashboard
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?oauth=success`;
      res.redirect(redirectUrl);
    });
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error logging out' 
      });
    }
    req.session.destroy();
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user._id ? req.user._id.toString() : req.user.id,
      email: req.user.email,
      name: req.user.name,
      authProvider: req.user.authProvider
    }
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true,
      user: {
        id: req.user._id ? req.user._id.toString() : req.user.id,
        email: req.user.email,
        name: req.user.name,
        authProvider: req.user.authProvider
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
