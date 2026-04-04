-- SQL Script to add missing columns to news table
-- Run this if you want to keep existing data

-- Add status column
ALTER TABLE news 
ADD COLUMN status ENUM('draft', 'published', 'archived') 
DEFAULT 'draft' NOT NULL 
AFTER image_url;

-- Add updated_at column if it doesn't exist
ALTER TABLE news 
ADD COLUMN updated_at DATETIME 
DEFAULT CURRENT_TIMESTAMP 
ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Update existing records to have 'published' status
UPDATE news SET status = 'published' WHERE status IS NULL;

-- Verify the changes
SELECT * FROM news LIMIT 5;
