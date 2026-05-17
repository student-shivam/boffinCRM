const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Check if admin already exists
    let admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@company.com' });

    if (admin) {
      console.log('Admin already exists. Updating password/name to match env vars...');
      admin.name = process.env.ADMIN_NAME || 'Ravindra Yadav';
      admin.password = process.env.ADMIN_PASSWORD || 'admin123';
      await admin.save();
      console.log('Admin updated and password hashed successfully!');
    } else {
      admin = await Admin.create({
        name: process.env.ADMIN_NAME || 'Ravindra Yadav',
        email: process.env.ADMIN_EMAIL || 'admin@company.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      });
      console.log(`Admin created successfully!`);
    }

    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
