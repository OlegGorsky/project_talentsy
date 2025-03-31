/*
  # Add onboarding flag to users table

  1. Changes
    - Add `onboarding_completed` column to users table
    - Default value is false for new users
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;