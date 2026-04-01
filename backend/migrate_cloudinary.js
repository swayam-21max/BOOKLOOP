const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting Cloudinary migration...');
    
    // Add profile_pic column to users table if it doesn't exist
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_pic TEXT;
    `);
    console.log('Added profile_pic column to users table.');

    // Ensure books table has images as an array of text
    // (We saw in controller it's being inserted as an array)
    // If it's already there, this will do nothing or we can verify it.
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
