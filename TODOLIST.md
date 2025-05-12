# DataMatch System Todo List

This document outlines the development stages and tasks for creating a simple datamatch system for approximately 70 people.

## Overview
- A survey system where users select themselves from a list and answer multiple-choice questions
- Results page that shows matches (most similar and most different people)
- Admin panel for survey creation, monitoring progress, and activating results
- No authentication required (user selection via dropdown)
- Local storage for user persistence
- Neon PostgreSQL database for storage

## Development Stages

### Stage 1: Project Setup

- [x] Initialize Next.js project with App Router
- [x] Configure Tailwind CSS and Shadcn UI
- [x] Set up Neon PostgreSQL database connection
- [x] Set up database connection configuration

### Stage 2: User Selection & Persistence

- [x] Create users table in database
- [x] Create user selection component (dropdown)
- [x] Implement local storage persistence
- [x] Create basic layout with navigation (admin panel)

### Stage 3: Admin Panel

- [x] Create admin dashboard
- [x] Implement user management
  - [x] List users functionality
  - [x] Add individual users with validation
  - [x] Add bulk users functionality
  - [x] Edit user functionality
  - [x] Delete user functionality
  - [x] Error handling with specific error messages
- [x] Implement survey question management
  - [x] Create questions table in database
  - [x] Create question form with validation
  - [x] List questions with card layout
  - [x] Edit and delete questions functionality
  - [x] Question reordering with up/down arrows
  - [x] Bulk question addition
- [x] Create empty results management page
- [ ] User progress tracking view
- [ ] Results processing activation button

### Stage 4: Survey System

- [ ] Create survey page
- [ ] Implement survey flow
  - [ ] Progress indicator
  - [ ] Question display
  - [ ] Response submission
  - [ ] Completion confirmation
- [ ] Create responses table in database
- [ ] Store responses in database

### Stage 5: Results Processing

- [ ] Create results table in database
- [ ] Implement matching algorithm
  - [ ] Calculate similarity scores between users
  - [ ] Determine most similar matches
  - [ ] Determine most different matches
- [ ] Store match results in database

### Stage 6: Results Display

- [ ] Create results page UI
- [ ] Implement conditional access (only when results are processed)
- [ ] Display similar matches section
- [ ] Display different matches section

### Stage 7: Testing & Refinement

- [ ] Comprehensive testing
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Bug fixes

## Database Schema (Incremental Approach)

Instead of creating all tables at once, we'll create each table when implementing the relevant feature:

### Stage 2: Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  has_completed_survey BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Stage 3: Questions Table
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Stage 4: Responses Table
```sql
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  response_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```

### Stage 5: Results Table
```sql
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  match_user_id INTEGER REFERENCES users(id),
  similarity_score FLOAT NOT NULL,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_user_id)
);
```

## Technical Stack

- **Frontend**: Next.js with App Router, Tailwind CSS, Shadcn UI
- **Forms**: React Hook Form with Zod validation
- **Database**: Neon PostgreSQL
- **API**: Next.js API Routes / Server Actions
- **State Management**: React Context with local storage
