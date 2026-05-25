-- BOOKLOOP V2 Database Migration Schema

-- 1. Alter Users Table to add campus-specific and profile details
ALTER TABLE users ADD COLUMN IF NOT EXISTS college VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS semester VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Alter Wishlists Table for granular match alerts
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS keyword VARCHAR(255);
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS max_price DECIMAL(10, 2);

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Favorites / Bookmarks Table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- 5. Recently Viewed Books Table
CREATE TABLE IF NOT EXISTS recent_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- 6. Book Views Table (for aggregate popularity counters)
CREATE TABLE IF NOT EXISTS book_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Transactions Table (BUY/SWAP records)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('BUY', 'SWAP')) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('completed', 'pending', 'rejected')) DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Flags & Moderation Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    reason VARCHAR(50) CHECK (reason IN ('Fake Listing', 'Spam', 'Abuse', 'Fraud')) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('pending', 'resolved', 'ignored')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Optimization Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_views_user_id ON recent_views(user_id);
CREATE INDEX IF NOT EXISTS idx_book_views_book_id ON book_views(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_reports_book_id ON reports(book_id);
