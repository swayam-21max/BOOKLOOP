-- Add new columns for Direct Book Swapping to requests table
ALTER TABLE requests ADD COLUMN request_type VARCHAR(50) CHECK (request_type IN ('buy', 'swap')) DEFAULT 'buy';
ALTER TABLE requests ADD COLUMN offered_book_id UUID REFERENCES books(id) ON DELETE SET NULL;

-- Create Wishlists table for match alerts
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
