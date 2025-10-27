-- Create enum for badge types and tiers
CREATE TYPE badge_category AS ENUM ('clubs', 'notes', 'marketplace');
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');

-- Badges table (predefined badges)
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category badge_category NOT NULL,
    tier badge_tier NOT NULL,
    requirement_count INTEGER NOT NULL, -- 1, 3, or 5
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned badges)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Create indexes for better performance
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_tier ON badges(tier);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- Insert the badges (3 categories, 3 tiers) with icon URLs
INSERT INTO badges (name, description, category, tier, requirement_count, icon_url) VALUES
('Club Explorer', 'Join your first club', 'clubs', 'bronze', 1, '/badges/club-bronze.png'),
('Social Butterfly', 'Join 3 clubs', 'clubs', 'silver', 3, '/badges/club-silver.png'),
('Network Master', 'Join 5 clubs', 'clubs', 'gold', 5, '/badges/club-gold.png'),
('First Contributor', 'Post your first note', 'notes', 'bronze', 1, '/badges/note-bronze.png'),
('Knowledge Sharer', 'Post 3 notes', 'notes', 'silver', 3, '/badges/note-silver.png'),
('Study Helper', 'Post 5 notes', 'notes', 'gold', 5, '/badges/note-gold.png'),
('Market Newbie', 'Post your first marketplace item', 'marketplace', 'bronze', 1, '/badges/marketplace-bronze.png'),
('Market Trader', 'Post 3 marketplace items', 'marketplace', 'silver', 3, '/badges/marketplace-silver.png'),
('Market Master', 'Post 5 marketplace items', 'marketplace', 'gold', 5, '/badges/marketplace-gold.png');