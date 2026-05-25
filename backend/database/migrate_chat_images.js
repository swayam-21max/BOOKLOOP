const { pool } = require('../config/db');

async function migrate() {
  try {
    console.log('Migrating messages table for image support...');
    await pool.query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
    `);
    console.log('Messages table successfully migrated for chat images!');
  } catch (err) {
    console.error('Error migrating messages table:', err);
  } finally {
    pool.end();
  }
}

migrate();
