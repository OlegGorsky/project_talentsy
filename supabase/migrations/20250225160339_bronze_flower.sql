/*
  # Add start_data column to users table

  1. Changes
    - Add JSONB column `start_data` to users table to store decoded startapp data
    - Column is nullable since not all users will have start data
    - Using JSONB to store arbitrary JSON data from startapp parameter

  2. Notes
    - JSONB type allows storing any JSON structure
    - Maintains backwards compatibility with existing referral system
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS start_data JSONB;