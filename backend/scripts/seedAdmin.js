const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

const User = require('../models/User');

async function seedAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Error: MONGO_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`Admin account already exists: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Check if admin@cyberaudit.com exists
    const adminEmail = 'admin@cyberaudit.com';
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Updated existing user ${adminEmail} to role: admin`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', salt);

      user = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`Created default admin account: ${user.email} (Role: ${user.role})`);
    }

    console.log('Admin account is ready for Experiment 6 testing.');
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
