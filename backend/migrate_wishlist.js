const db = require('./config/db');

async function migrate() {
    try {
        console.log('Updating wishlists table...');
        await db.query(`
            ALTER TABLE wishlists ALTER COLUMN query DROP NOT NULL;
            ALTER TABLE wishlists ADD COLUMN book_id UUID REFERENCES books(id) ON DELETE CASCADE;
        `);
        console.log('Wishlist table updated successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        process.exit();
    }
}

migrate();
