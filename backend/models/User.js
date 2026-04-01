const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String },                    // ← no longer required
  role:       { type: String, enum: ['admin','auditor','department'], default: 'department' },
  department: { type: String, default: '' },
  googleId:   { type: String },                    // ← new
  avatar:     { type: String },                    // ← new
  isActive:   { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);