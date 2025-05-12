-- Datamatch Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  has_completed_survey BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Questions (Multiple Choice Only)
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL, -- The actual question text
  order_position INTEGER NOT NULL, -- For ordering questions in the survey
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Options for multiple choice
CREATE TABLE IF NOT EXISTS question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL, -- The text of the option
  order_position INTEGER NOT NULL, -- For ordering options within a question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Responses - stores each user's answer to each question
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Each user can only have one response per question
  UNIQUE(user_id, question_id)
);

-- Match Results - stores pre-computed match scores between users
CREATE TABLE IF NOT EXISTS match_results (
  id SERIAL PRIMARY KEY,
  user_id_1 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  common_answers INTEGER NOT NULL, -- Number of questions answered the same way
  total_possible INTEGER NOT NULL, -- Total number of questions both users answered
  match_percentage NUMERIC(5,2), -- Calculated percentage (common_answers / total_possible * 100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure we don't duplicate pairs (user1-user2 and user2-user1 would be the same)
  -- We'll enforce user_id_1 < user_id_2 when inserting data
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2) -- Ensures consistent ordering of user pairs
);
