/*
  # Add keyword completion tracking to users table

  1. Changes
    - Add keyword_completed column to users table to track article completion
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS keyword_completed boolean DEFAULT false;