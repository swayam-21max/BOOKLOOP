const fs = require('fs');
const { pool } = require('./config/db');

async function run() {
  try {
    const sql = fs.readFileSync('../update_schema.sql', 'utf8');
    await pool.query(sql);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

run();
