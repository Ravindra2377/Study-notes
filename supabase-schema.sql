-- Create users table for tracking usage and subscriptions
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  documents_processed INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table for storing generated study notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  notes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true);

-- Optional: Create function for incrementing usage counter
CREATE OR REPLACE FUNCTION increment_usage(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET documents_processed = documents_processed + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
