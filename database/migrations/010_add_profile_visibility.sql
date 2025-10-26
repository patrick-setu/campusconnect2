-- add visibility control for user privacy
ALTER TABLE user_profiles
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true;

-- index for faster visibility filters
CREATE INDEX idx_user_profiles_visibility ON user_profiles(is_public);

-- document the column usage
COMMENT ON COLUMN user_profiles.is_public IS 'Controls whether the profile is visible to other users. Default is true (visible).';