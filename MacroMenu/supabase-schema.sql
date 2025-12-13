-- MacroMenu Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the user_profiles table

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile data
  goal TEXT, -- 'bulk', 'cut', 'maintain'
  gender TEXT,
  height INTEGER, -- in inches
  current_weight INTEGER,
  goal_weight INTEGER,
  timeline TEXT,
  activity_level TEXT,
  eating_style TEXT,
  days_eating_out TEXT,

  -- Macros (calculated)
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,

  -- Preferences (stored as JSONB)
  favorite_restaurants JSONB DEFAULT '[]',
  food_likes JSONB DEFAULT '{"cuisines":[],"entrees":[],"proteins":[],"sides":[],"flavors":[]}',
  food_dislikes JSONB DEFAULT '{"cuisines":[],"entrees":[],"proteins":[],"sides":[],"flavors":[]}',

  -- Restrictions
  allergies JSONB DEFAULT '[]',
  dietary_preferences JSONB DEFAULT '[]',

  -- Recent activity
  recent_restaurants JSONB DEFAULT '[]',

  -- Metadata
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create policy: Users can only read their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for re-running this script)
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;

-- Create trigger for updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for re-running this script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;
