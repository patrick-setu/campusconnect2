-- Migration 008: User Profiles
-- description: create user_profiles table to store extended profile information

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    profile_image_url VARCHAR(500),
    about TEXT,
    interests TEXT[],
    current_courses TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- trigger to update updated_at on change
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- record this migration if migrations table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'migrations'
    ) THEN
        INSERT INTO migrations (migration_name) VALUES ('008_user_profiles');
    END IF;
END $$;
