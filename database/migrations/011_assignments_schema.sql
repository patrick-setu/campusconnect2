-- create assignments table 
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_code VARCHAR(50) NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT,
  due_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- indexes for assignments table
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
