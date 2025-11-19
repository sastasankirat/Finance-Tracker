const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, index: true },
  name: { type: String, default: '' },
  password: { type: String, default: null },
  googleId: { type: String, index: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  authProvider: { type: String, default: 'local' },
  createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Mongoose creates .id virtual by default (string of _id)

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  otp: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true }
});

// Optional: TTL index for automatic removal
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

// Find user by email
const findUserByEmail = async (email) => {
  if (!email) return null;
  return User.findOne({ email: email.toLowerCase() }).lean();
};

// Find user by ID
const findUserById = async (id) => {
  if (!id) return null;
  try {
    const user = await User.findById(id).lean();
    // Ensure _id is present in the returned object
    if (user && !user._id) {
      user._id = user._id || id;
    }
    return user;
  } catch (error) {
    console.error('Error finding user by id:', error);
    return null;
  }
};

// Find user by Google ID
const findUserByGoogleId = async (googleId) => {
  if (!googleId) return null;
  return User.findOne({ googleId }).lean();
};

// Create new user
const createUser = async (userData) => {
  const doc = new User({
    email: userData.email ? userData.email.toLowerCase() : undefined,
    name: userData.name || '',
    password: userData.password || null,
    googleId: userData.googleId || null,
    isVerified: userData.isVerified || false,
    authProvider: userData.authProvider || (userData.googleId ? 'google' : 'local')
  });

  const saved = await doc.save();
  return saved.toObject();
};

// Update user
const updateUser = async (id, updates) => {
  if (!id) return null;
  try {
    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
    return updated;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Store OTP
const storeOTP = async (email, otp, type = 'verification') => {
  const now = new Date();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Remove existing OTPs for this email and type
  await OTP.deleteMany({ email: email.toLowerCase(), type });

  const otpDoc = new OTP({
    email: email.toLowerCase(),
    otp: otp.toString(),
    type,
    createdAt: now,
    expiresAt
  });

  const saved = await otpDoc.save();
  return saved.toObject();
};

// Verify OTP
const verifyOTP = async (email, otp, type = 'verification') => {
  const now = new Date();
  const otpDoc = await OTP.findOne({
    email: email.toLowerCase(),
    otp: otp.toString(),
    type,
    expiresAt: { $gt: now }
  });

  if (otpDoc) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return true;
  }

  return false;
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByGoogleId,
  createUser,
  updateUser,
  storeOTP,
  verifyOTP
};