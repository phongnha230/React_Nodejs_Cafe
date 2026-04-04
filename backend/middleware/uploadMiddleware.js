let multer;
try {
  multer = require('multer');
} catch (_) {
  multer = null;
}

const notInstalled = (req, res, next) => {
  res.status(500).json({ message: 'File upload not available. Please install multer: npm i multer' });
};

const fallback = {
  single: () => notInstalled,
  array: () => notInstalled,
  fields: () => notInstalled,
};

if (!multer) {
  module.exports = fallback;
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
    filename: (req, file, cb) => {
      const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);
      const original = file.originalname || 'file';
      cb(null, unique + '_' + original);
    },
  });

  const limits = { fileSize: Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024) };
  const upload = multer({ storage, limits });

  module.exports = {
    single: (field) => upload.single(field),
    array: (field, max) => upload.array(field, max),
    fields: (defs) => upload.fields(defs),
  };
}

