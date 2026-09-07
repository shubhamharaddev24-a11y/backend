const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User.model');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shubham-photos';

const seedAdmin = async () => {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@creaonnect.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminEmail });

    
    if (existingUser) {
      console.log(`\n[INFO] Admin user already exists with email: ${adminEmail}`);
      console.log(`If you forgot the password, you can delete this user and re-run this script.`);
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });

      console.log(`\n[SUCCESS] Default Admin user created successfully!`);
      console.log(`-----------------------------------------------`);
      console.log(`Email:    ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role:     ${admin.role}`);
      console.log(`-----------------------------------------------`);
    }

    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
