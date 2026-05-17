const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

const isRemoteSource = (value) => /^https?:\/\//i.test(value) || /^data:/i.test(value);

const requiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

async function main() {
  const input = process.argv.slice(2).join(' ').trim();

  if (!input) {
    console.error('Usage: npm run test:cloudinary -- <image-or-video-path-or-url>');
    console.error('Example: npm run test:cloudinary -- ./uploads/sample.jpg');
    console.error('Example: npm run test:cloudinary -- C:\\tmp\\sample-video.mp4');
    process.exit(1);
  }

  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (missingEnv.length > 0) {
    console.error(`Missing Cloudinary env: ${missingEnv.join(', ')}`);
    process.exit(1);
  }

  const uploadSource = isRemoteSource(input) ? input : path.resolve(input);

  if (!isRemoteSource(uploadSource) && !fs.existsSync(uploadSource)) {
    console.error(`File not found: ${uploadSource}`);
    process.exit(1);
  }

  console.log(`Uploading to Cloudinary: ${uploadSource}`);

  const result = await cloudinary.v2.uploader.upload(uploadSource, {
    folder: process.env.CLOUDINARY_TEST_FOLDER || 'cafe_app_test_uploads',
    resource_type: 'auto',
  });

  console.log('Upload successful');
  console.log(JSON.stringify({
    public_id: result.public_id,
    resource_type: result.resource_type,
    format: result.format,
    bytes: result.bytes,
    secure_url: result.secure_url,
  }, null, 2));
}

main().catch((error) => {
  console.error('Upload failed');
  console.error(error.message || error);
  process.exit(1);
});
