/**
 * Product Service
 * Business logic for product operations
 */

const Product = require('../models/product');
const Review = require('../models/review');
const logger = require('../config/logger');

class ProductService {
    /**
     * Get all products
     * @param {object} options - Query options (category, search, page, limit, isAvailable)
     * @returns {Promise<object>} Products list with pagination
     */
    async getAllProducts(options = {}) {
        const { category, search, page = 1, limit = 10, isAvailable } = options;
        const offset = (page - 1) * limit;

        const where = {};

        // Filter by category
        if (category) {
            where.category = category;
        }

        // Filter by availability
        if (typeof isAvailable === 'boolean') {
            where.is_available = isAvailable;
        }

        // Search by name
        if (search) {
            where.name = {
                [require('sequelize').Op.like]: `%${search}%`
            };
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']],
            include: [{
                model: Review,
                as: 'reviews',
                required: false
            }]
        });

        return {
            products: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get product by ID
     * @param {number} productId - Product ID
     * @returns {Promise<object>} Product object
     */
    async getProductById(productId) {
        const product = await Product.findByPk(productId, {
            include: [{
                model: Review,
                as: 'reviews',
                include: [{
                    model: require('../models/user'),
                    attributes: ['id', 'username']
                }]
            }]
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }

    /**
     * Create new product
     * @param {object} productData - Product data
     * @returns {Promise<object>} Created product
     */
    async createProduct(productData) {
        const { name, price, image, category, is_available = true } = productData;

        // Validation
        if (!name || typeof price !== 'number') {
            throw new Error('Name and numeric price are required');
        }

        if (price < 0) {
            throw new Error('Price must be non-negative');
        }

        const product = await Product.create({
            name,
            price,
            image: image || null,
            category: category || null,
            is_available
        });

        logger.info('Product created', { productId: product.id, name: product.name });

        return product;
    }

    /**
     * Update product
     * @param {number} productId - Product ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated product
     */
    async updateProduct(productId, updateData) {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        const { name, price, image, category, is_available } = updateData;

        // Validate price if provided
        if (typeof price === 'number' && price < 0) {
            throw new Error('Price must be non-negative');
        }

        await product.update({
            name: name ?? product.name,
            price: typeof price === 'number' ? price : product.price,
            image: image !== undefined ? image : product.image,
            category: category !== undefined ? category : product.category,
            is_available: typeof is_available === 'boolean' ? is_available : product.is_available
        });

        logger.info('Product updated', { productId: product.id });

        return product;
    }

    /**
     * Delete product
     * @param {number} productId - Product ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProduct(productId) {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        await product.destroy();

        logger.info('Product deleted', { productId });

        return true;
    }

    /**
     * Toggle product availability
     * @param {number} productId - Product ID
     * @returns {Promise<object>} Updated product
     */
    async toggleAvailability(productId) {
        const product = await Product.findByPk(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        await product.update({
            is_available: !product.is_available
        });

        logger.info('Product availability toggled', {
            productId,
            isAvailable: product.is_available
        });

        return product;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Products in category
     */
    async getProductsByCategory(category) {
        const products = await Product.findAll({
            where: { category, is_available: true },
            order: [['name', 'ASC']]
        });

        return products;
    }

    /**
     * Get product statistics
     * @returns {Promise<object>} Product statistics
     */
    async getProductStatistics() {
        const total = await Product.count();
        const available = await Product.count({ where: { is_available: true } });
        const unavailable = await Product.count({ where: { is_available: false } });

        // Get categories
        const products = await Product.findAll({
            attributes: ['category'],
            group: ['category']
        });

        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

        return {
            total,
            available,
            unavailable,
            categories: categories.length,
            categoryList: categories
        };
    }
}

module.exports = new ProductService();
