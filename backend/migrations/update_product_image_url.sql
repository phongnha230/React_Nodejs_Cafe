-- Allow Cloudinary image/video URLs to be stored without truncation.
ALTER TABLE products MODIFY COLUMN image_url TEXT;
