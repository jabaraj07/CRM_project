// Script to create the first admin user

// Usage:
//   node create-admin.js
//   node create-admin.js admin@company.com MySecurePassword123 "Admin Name"

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get credentials from command line arguments or use defaults
    const email = process.argv[2] || 'admin@crm.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user(s) already exist in the system.');
      console.log(`   Found admin: ${existingAdmin.email}`);
      console.log('   You can login with existing admin credentials.');
      console.log('   Or use the admin panel to create more admins.');
      await mongoose.disconnect();
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️  User with email ${email} already exists.`);
      console.log('   Please use a different email or update the existing user to Admin role.');
      await mongoose.disconnect();
      return;
    }

    // Validate password length
    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters long');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Admin',
    });

    console.log('\n✅ First admin user created successfully!');
    console.log('='.repeat(60));
    console.log('Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('='.repeat(60));
    console.log('\n📝 Next Steps:');
    console.log('1. Login with these credentials');
    console.log('2. Access the Admin Panel to create more users/admins');
    console.log('3. Change the password after first login for security');
    console.log('\n⚠️  This is the standard approach for creating the first admin in production systems.\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

