const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedFormats = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
];

const storage = cloudinaryStorage({
  cloudinary,
  allowedFormats,
  params: {
    folder: 'cafe_app_uploads',
    resource_type: 'auto',
    allowed_formats: allowedFormats,
  },
});

module.exports = { cloudinary, storage };
