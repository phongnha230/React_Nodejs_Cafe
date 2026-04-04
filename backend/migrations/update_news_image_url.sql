-- Migration to update news.image_url column from VARCHAR(255) to TEXT
-- This allows storing base64 encoded images which can be very long

ALTER TABLE news MODIFY COLUMN image_url TEXT;
