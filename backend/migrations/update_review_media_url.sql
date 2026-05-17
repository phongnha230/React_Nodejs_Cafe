-- Allow reviews to store Cloudinary image/video URLs.
ALTER TABLE reviews ADD COLUMN media_url TEXT NULL;
