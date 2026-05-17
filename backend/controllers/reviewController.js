/**
 * Review Controller
 * HTTP layer - handles requests and responses
 */

const reviewService = require('../services/reviewService');
const { success, error, created, paginated } = require('../utils/responseFormatter');
const logger = require('../config/logger');
const upload = require('../middleware/uploadMiddleware');
const { cloudinary } = require('../config/cloudinary');

exports.uploadMedia = upload.single('media');

const resolveReviewMediaUrl = async (req) => {
  if (req.file) {
    return req.file.path;
  }

  const mediaSource = req.body.media_url || req.body.mediaUrl || req.body.media;
  if (!mediaSource) {
    return undefined;
  }

  if (
    typeof mediaSource === 'string' &&
    (mediaSource.startsWith('data:image') || mediaSource.startsWith('data:video'))
  ) {
    const uploadResponse = await cloudinary.v2.uploader.upload(mediaSource, {
      folder: 'cafe_app_review_uploads',
      resource_type: 'auto',
    });
    return uploadResponse.secure_url;
  }

  return mediaSource;
};

/**
 * Create new review
 */
exports.create = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 401));
    }

    const mediaUrl = await resolveReviewMediaUrl(req);
    const review = await reviewService.createReview(req.user.id, {
      ...req.body,
      media_url: mediaUrl
    });
    res.status(201).json(created(review, 'Review created successfully'));
  } catch (err) {
    logger.error('Create review error:', err);

    if (err.message.includes('required') || err.message.includes('must be')) {
      return res.status(400).json(error(err.message, 400));
    }

    if (err.message.includes('purchased') || err.message.includes('received')) {
      return res.status(403).json(error(err.message, 403));
    }

    if (err.message.includes('already reviewed')) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Create review error', 500, err.message));
  }
};

/**
 * Get all reviews
 */
exports.list = async (req, res) => {
  try {
    const { product_id, user_id, page, limit } = req.query;

    const result = await reviewService.getAllReviews({
      productId: product_id ? Number(product_id) : undefined,
      userId: user_id ? Number(user_id) : undefined,
      page,
      limit
    });

    res.json(paginated(
      result.reviews,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    ));
  } catch (err) {
    logger.error('List reviews error:', err);
    res.status(500).json(error('List reviews error', 500, err.message));
  }
};

/**
 * Get review by ID
 */
exports.get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid review ID', 400));
    }

    const review = await reviewService.getReviewById(id);
    res.json(success(review));
  } catch (err) {
    if (err.message === 'Review not found') {
      return res.status(404).json(error('Review not found', 404));
    }
    res.status(500).json(error('Get review error', 500, err.message));
  }
};

/**
 * Update review
 */
exports.update = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 401));
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid review ID', 400));
    }

    const mediaUrl = await resolveReviewMediaUrl(req);
    const review = await reviewService.updateReview(id, req.user.id, {
      ...req.body,
      ...(mediaUrl !== undefined ? { media_url: mediaUrl } : {})
    });
    res.json(success(review, 'Review updated successfully'));
  } catch (err) {
    if (err.message === 'Review not found') {
      return res.status(404).json(error('Review not found', 404));
    }

    if (err.message.includes('only update your own')) {
      return res.status(403).json(error(err.message, 403));
    }

    if (err.message.includes('must be')) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Update review error', 500, err.message));
  }
};

/**
 * Delete review
 */
exports.remove = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 401));
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid review ID', 400));
    }

    await reviewService.deleteReview(id, req.user.id, req.user.role);
    res.json(success(null, 'Review deleted successfully'));
  } catch (err) {
    if (err.message === 'Review not found') {
      return res.status(404).json(error('Review not found', 404));
    }

    if (err.message.includes('only delete your own')) {
      return res.status(403).json(error(err.message, 403));
    }

    res.status(500).json(error('Delete review error', 500, err.message));
  }
};

/**
 * Get product review statistics
 */
exports.getProductStats = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId)) {
      return res.status(400).json(error('Invalid product ID', 400));
    }

    const stats = await reviewService.getProductReviewStats(productId);
    res.json(success(stats));
  } catch (err) {
    res.status(500).json(error('Get review statistics error', 500, err.message));
  }
};
