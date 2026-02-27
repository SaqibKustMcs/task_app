/**
 * Script to create an admin user in the database
 * Usage: node scripts/create-admin-user.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Simple ID generator
function generateStringId() {
  return crypto.randomBytes(16).toString('hex');
}

const UserSchema = new mongoose.Schema({
  _id: { type: String, default: generateStringId },
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  fullName: { type: String, default: '' },
  pic: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  color: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  userRole: { type: String, default: 'normal', enum: ['normal', 'seller', 'admin'] },
  userStatus: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  phoneNumber: { type: String, default: '' },
  village: { type: String, default: '' },
  country: { type: String, default: '' },
  homeAddress: { type: String, default: '' },
  zipcode: { type: String, default: '' },
  userLevel: { type: String, default: 'beginner', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  sellOrders: { type: Number, default: 0 },
  buyOrders: { type: Number, default: 0 },
  wishlist: { type: [String], default: [] },
  cart: { type: [String], default: [] },
  savedPosts: { type: [String], default: [] },
  twoFactorSecret: { type: String, default: null },
  isTwoFactorEnabled: { type: Boolean, default: false },
  isBiometric: { type: Boolean, default: false },
}, {
  collection: 'users',
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@jhamat.com';
    const adminPassword = 'Admin@123';
    const adminFullName = 'Admin User';

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email:', existingUser.email);
      console.log('   Role:', existingUser.userRole);
      console.log('   Verified:', existingUser.isEmailVerified);
      console.log('   Deleted:', existingUser.isDeleted);
      
      // Update to admin if not already
      if (existingUser.userRole !== 'admin') {
        console.log('🔄 Updating user role to admin...');
        existingUser.userRole = 'admin';
        existingUser.isEmailVerified = true;
        existingUser.isDeleted = false;
        await existingUser.save();
        console.log('✅ User role updated to admin');
      }
      
      // Update password if needed
      const isPasswordValid = await bcrypt.compare(adminPassword, existingUser.password);
      if (!isPasswordValid) {
        console.log('🔄 Updating password...');
        const saltRounds = 10;
        existingUser.password = await bcrypt.hash(adminPassword, saltRounds);
        await existingUser.save();
        console.log('✅ Password updated');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    console.log('👤 Creating admin user...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      fullName: adminFullName,
      name: adminFullName,
      userRole: 'admin',
      userStatus: 'active',
      isEmailVerified: true,
      isDeleted: false,
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   Role: admin');
    console.log('   Verified: true');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createAdminUser();

