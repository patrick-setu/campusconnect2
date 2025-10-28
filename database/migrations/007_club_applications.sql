CREATE TABLE IF NOT EXISTS club_applications (
  id SERIAL PRIMARY KEY,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, denied
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- add columns if they dont exist
ALTER TABLE club_applications 
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unknown';

ALTER TABLE club_applications 
  ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) NOT NULL DEFAULT '';

ALTER TABLE club_applications 
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_club_applications_club_id ON club_applications(club_id);
CREATE INDEX IF NOT EXISTS idx_club_applications_user_id ON club_applications(user_id);

INSERT INTO migrations (migration_name) VALUES ('007_club_applications');