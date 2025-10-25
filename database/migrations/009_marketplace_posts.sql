-- Create marketplace table
CREATE TABLE marketplace_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price VARCHAR(50), -- Store as string to allow "Free", "$50", "Negotiable", etc.
    category VARCHAR(20) NOT NULL CHECK (category IN ('selling', 'lost', 'buying')),
    contact VARCHAR(255) NOT NULL, -- Email, Instagram, phone, etc.
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_marketplace_posts_creator ON marketplace_posts(creator_id);
CREATE INDEX idx_marketplace_posts_category ON marketplace_posts(category);
CREATE INDEX idx_marketplace_posts_created ON marketplace_posts(created_at);

