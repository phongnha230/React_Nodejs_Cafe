const multer = require('multer');
const { storage } = require('../config/cloudinary');

/**
 * Cloudinary Upload Middleware
 * Sử dụng CloudinaryStorage thay vì DiskStorage
 */
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

module.exports = {
  single: (field) => upload.single(field),
  array: (field, max) => upload.array(field, max),
  fields: (defs) => upload.fields(defs),
};
