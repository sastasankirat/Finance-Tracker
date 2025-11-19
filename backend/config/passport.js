const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { findUserByEmail, findUserById, findUserByGoogleId, createUser, updateUser } = require('../models/userModel');

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await findUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.isVerified) {
        return done(null, false, { message: 'Please verify your email first' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;

      // Prefer lookup by Google ID first
      let user = await findUserByGoogleId(profile.id);

      // If not found by googleId, try by email (user might have signed up locally)
      if (!user && email) {
        user = await findUserByEmail(email);
      }

      if (user) {
        // If user found but not linked to Google, link the account
        if (!user.googleId) {
          await updateUser(user._id, { googleId: profile.id, authProvider: 'google', isVerified: true });
          // re-fetch updated user
          user = await findUserById(user._id.toString());
        }

        return done(null, user);
      }

      // Create new user when none exists
      const newUserData = {
        email: email || undefined,
        name: profile.displayName || '',
        googleId: profile.id,
        isVerified: true, // Google accounts are pre-verified
        authProvider: 'google'
      };

      user = await createUser(newUserData);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user - store the MongoDB _id
passport.serializeUser((user, done) => {
  try {
    const userId = user._id ? user._id.toString() : user.id;
    done(null, userId);
  } catch (error) {
    done(error);
  }
});

// Deserialize user - fetch from DB using the stored id
passport.deserializeUser(async (id, done) => {
  try {
    if (!id) {
      return done(null, false);
    }
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(null, false);
  }
});

module.exports = passport;