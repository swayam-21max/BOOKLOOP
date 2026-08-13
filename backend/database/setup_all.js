const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function run() {
  try {
    const files = [
      path.join(__dirname, '../../schema.sql'),
      path.join(__dirname, '../../update_schema.sql'),
      path.join(__dirname, 'migration_v2.sql')
    ];

    for (const filePath of files) {
      if (fs.existsSync(filePath)) {
        console.log(`Executing SQL script: ${filePath}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          await pool.query(sql);
          console.log(`Successfully applied: ${path.basename(filePath)}`);
        } catch (err) {
          console.warn(`Notice during ${path.basename(filePath)}:`, err.message);
        }
      }
    }
    console.log('Database initialization & migrations complete!');
  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    await pool.end();
  }
}

run();
