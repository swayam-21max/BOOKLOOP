const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'migration_v2.sql');
    console.log(`Reading migration script from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Database migration V2 executed successfully!');
  } catch (err) {
    console.error('Migration V2 failed:', err);
  } finally {
    pool.end();
  }
}

run();
