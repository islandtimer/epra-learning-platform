require('dotenv').config();
const User = require('../src/models/User');
const UserSettings = require('../src/models/UserSettings');
const db = require('../src/database/connection');

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    const adminData = {
      email: 'admin@epra.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      organization: 'EPRA Learning Platform',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(adminData.email);
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      process.exit(1);
    }

    // Create admin user
    const adminUser = await User.create(adminData);
    console.log('✅ Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.first_name,
      lastName: adminUser.last_name,
      role: adminUser.role
    });

    // Create default settings for admin
    await UserSettings.create(adminUser.id);
    console.log('✅ Admin user settings created');

    console.log('\n🎉 Admin account ready!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

createAdminUser();