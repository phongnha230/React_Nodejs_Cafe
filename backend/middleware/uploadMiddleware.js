const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = {
  single: (field) => upload.single(field),
  array: (field, max) => upload.array(field, max),
  fields: (defs) => upload.fields(defs),
};
