require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/database/connection');

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database schema...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await db.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('📋 Tables created:');
    console.log('   - users');
    console.log('   - learning_progress');
    console.log('   - chat_sessions');
    console.log('   - chat_messages');
    console.log('   - api_usage');
    console.log('   - user_settings');
    console.log('   - refresh_tokens');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

setupDatabase();