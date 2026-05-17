/**
 * Review Service
 * Business logic for review operations
 */

const Review = require('../models/review');
const sequelize = require('../config/database');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Payment = require('../models/payment');
const User = require('../models/user');
const CoinTransaction = require('../models/coinTransaction');
const { ORDER_STATUS } = require('../constants/orderStatus');
const logger = require('../config/logger');

const REVIEW_REWARD_COINS = Number(process.env.REVIEW_REWARD_COINS || 10);

class ReviewService {
    /**
     * Create new review
     * @param {number} userId - User ID
     * @param {object} reviewData - Review data
     * @returns {Promise<object>} Created review
     */
    async createReview(userId, reviewData) {
        const { product_id, rating, comment, media_url } = reviewData;
        const productId = Number(product_id);
        const ratingValue = Number(rating);

        // Validation
        if (!Number.isInteger(productId) || !Number.isFinite(ratingValue)) {
            throw new Error('Product ID and numeric rating are required');
        }

        if (ratingValue < 1 || ratingValue > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Check if user has purchased and received the product
        const hasPurchased = await this.checkUserPurchased(userId, productId);
        if (!hasPurchased) {
            throw new Error('You can only review products you have purchased and received');
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            where: {
                product_id: productId,
                user_id: userId
            }
        });

        if (existingReview) {
            throw new Error('You have already reviewed this product. Please update your existing review instead.');
        }

        const transaction = await sequelize.transaction();
        let review;

        try {
            // Create review
            review = await Review.create({
                product_id: productId,
                rating: ratingValue,
                comment: comment || null,
                media_url: media_url || null,
                user_id: userId
            }, { transaction });

            if (REVIEW_REWARD_COINS > 0) {
                await User.increment(
                    { coins: REVIEW_REWARD_COINS },
                    { where: { id: userId }, transaction }
                );

                await CoinTransaction.create({
                    user_id: userId,
                    review_id: review.id,
                    amount: REVIEW_REWARD_COINS,
                    type: 'review_reward',
                    description: 'Reward for product review'
                }, { transaction });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        logger.info('Review created', {
            reviewId: review.id,
            userId,
            productId,
            rating: ratingValue
        });

        return {
            ...review.toJSON(),
            reward_coins: REVIEW_REWARD_COINS
        };
    }

    /**
     * Check if user has purchased and received the product
     * @param {number} userId - User ID
     * @param {number} productId - Product ID
     * @returns {Promise<boolean>} True if user has purchased
     */
    async checkUserPurchased(userId, productId) {
        // Find delivered order with the product
        const purchasedOrder = await Order.findOne({
            where: {
                user_id: userId,
                status: ORDER_STATUS.DELIVERED
            },
            include: [{
                model: OrderItem,
                as: 'items',
                where: { product_id: productId },
                required: true
            }]
        });

        if (!purchasedOrder) {
            return false;
        }

        // Check if order is paid
        const payment = await Payment.findOne({
            where: {
                order_id: purchasedOrder.id
            }
        });

        if (!payment || (payment.status !== 'completed' && payment.status !== 'success')) {
            return false;
        }

        return true;
    }

    /**
     * Get all reviews
     * @param {object} options - Query options (productId, userId, page, limit)
     * @returns {Promise<object>} Reviews list with pagination
     */
    async getAllReviews(options = {}) {
        const { productId, userId, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const where = {};
        if (productId) where.product_id = productId;
        if (userId) where.user_id = userId;

        const { count, rows } = await Review.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'username'],
                required: false
            }]
        });

        return {
            reviews: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get review by ID
     * @param {number} reviewId - Review ID
     * @returns {Promise<object>} Review object
     */
    async getReviewById(reviewId) {
        const review = await Review.findByPk(reviewId, {
            include: [{
                model: User,
                attributes: ['id', 'username']
            }]
        });

        if (!review) {
            throw new Error('Review not found');
        }

        return review;
    }

    /**
     * Update review
     * @param {number} reviewId - Review ID
     * @param {number} userId - User ID (for authorization)
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated review
     */
    async updateReview(reviewId, userId, updateData) {
        const review = await Review.findByPk(reviewId);

        if (!review) {
            throw new Error('Review not found');
        }

        // Check ownership
        if (review.user_id !== userId) {
            throw new Error('You can only update your own reviews');
        }

        const { rating, comment, media_url } = updateData;
        const ratingValue = rating !== undefined ? Number(rating) : undefined;

        // Validate rating if provided
        if (rating !== undefined && (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }

        await review.update({
            rating: rating !== undefined ? ratingValue : review.rating,
            comment: comment !== undefined ? comment : review.comment,
            media_url: media_url !== undefined ? media_url : review.media_url
        });

        logger.info('Review updated', { reviewId, userId });

        return review;
    }

    /**
     * Delete review
     * @param {number} reviewId - Review ID
     * @param {number} userId - User ID (for authorization)
     * @param {string} role - User role
     * @returns {Promise<boolean>} Success status
     */
    async deleteReview(reviewId, userId, role) {
        const review = await Review.findByPk(reviewId);

        if (!review) {
            throw new Error('Review not found');
        }

        // Check ownership (admin can delete any review)
        if (role !== 'admin' && review.user_id !== userId) {
            throw new Error('You can only delete your own reviews');
        }

        await review.destroy();

        logger.info('Review deleted', { reviewId, userId });

        return true;
    }

    /**
     * Get product review statistics
     * @param {number} productId - Product ID
     * @returns {Promise<object>} Review statistics
     */
    async getProductReviewStats(productId) {
        const reviews = await Review.findAll({
            where: { product_id: productId }
        });

        if (reviews.length === 0) {
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        return {
            totalReviews: reviews.length,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution
        };
    }
}

module.exports = new ReviewService();
