/**
 * Menu Service
 * Business logic for menu section operations
 */

const MenuSection = require('../models/menuSection');
const Product = require('../models/product');
const logger = require('../config/logger');

class MenuService {
    /**
     * Create new menu section
     * @param {object} menuData - Menu section data
     * @returns {Promise<object>} Created menu section
     */
    async createMenuSection(menuData) {
        const { name, description } = menuData;

        // Validation
        if (!name) {
            throw new Error('Name is required');
        }

        // Check if menu section with same name exists
        const existing = await MenuSection.findOne({ where: { name } });
        if (existing) {
            throw new Error('Menu section with this name already exists');
        }

        const menuSection = await MenuSection.create({
            name,
            description: description || null
        });

        logger.info('Menu section created', {
            menuSectionId: menuSection.id,
            name: menuSection.name
        });

        return menuSection;
    }

    /**
     * Get all menu sections
     * @param {object} options - Query options (includeProducts, page, limit)
     * @returns {Promise<object>} Menu sections list
     */
    async getAllMenuSections(options = {}) {
        const { includeProducts = false, page, limit } = options;

        const queryOptions = {
            order: [['id', 'DESC']]
        };

        // Add pagination if provided
        if (page && limit) {
            const offset = (page - 1) * limit;
            queryOptions.limit = parseInt(limit);
            queryOptions.offset = parseInt(offset);
        }

        // Include products if requested
        if (includeProducts) {
            queryOptions.include = [{
                model: Product,
                as: 'products',
                where: { is_available: true },
                required: false
            }];
        }

        const menuSections = await MenuSection.findAll(queryOptions);

        return menuSections;
    }

    /**
     * Get menu section by ID
     * @param {number} menuSectionId - Menu section ID
     * @param {boolean} includeProducts - Include products
     * @returns {Promise<object>} Menu section object
     */
    async getMenuSectionById(menuSectionId, includeProducts = false) {
        const queryOptions = {};

        if (includeProducts) {
            queryOptions.include = [{
                model: Product,
                as: 'products'
            }];
        }

        const menuSection = await MenuSection.findByPk(menuSectionId, queryOptions);

        if (!menuSection) {
            throw new Error('Menu section not found');
        }

        return menuSection;
    }

    /**
     * Update menu section
     * @param {number} menuSectionId - Menu section ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated menu section
     */
    async updateMenuSection(menuSectionId, updateData) {
        const menuSection = await MenuSection.findByPk(menuSectionId);

        if (!menuSection) {
            throw new Error('Menu section not found');
        }

        const { name, description } = updateData;

        // Check if new name conflicts with existing
        if (name && name !== menuSection.name) {
            const existing = await MenuSection.findOne({ where: { name } });
            if (existing) {
                throw new Error('Menu section with this name already exists');
            }
        }

        await menuSection.update({
            name: name || menuSection.name,
            description: description !== undefined ? description : menuSection.description
        });

        logger.info('Menu section updated', { menuSectionId });

        return menuSection;
    }

    /**
     * Delete menu section
     * @param {number} menuSectionId - Menu section ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteMenuSection(menuSectionId) {
        const menuSection = await MenuSection.findByPk(menuSectionId);

        if (!menuSection) {
            throw new Error('Menu section not found');
        }

        // Check if menu section has products
        const productCount = await Product.count({
            where: { menu_section_id: menuSectionId }
        });

        if (productCount > 0) {
            throw new Error('Cannot delete menu section with products. Please remove or reassign products first.');
        }

        await menuSection.destroy();

        logger.info('Menu section deleted', { menuSectionId });

        return true;
    }

    /**
     * Get menu sections with product count
     * @returns {Promise<Array>} Menu sections with product counts
     */
    async getMenuSectionsWithProductCount() {
        const menuSections = await MenuSection.findAll({
            include: [{
                model: Product,
                as: 'products',
                attributes: []
            }],
            attributes: {
                include: [
                    [
                        require('sequelize').fn('COUNT', require('sequelize').col('products.id')),
                        'productCount'
                    ]
                ]
            },
            group: ['MenuSection.id'],
            order: [['id', 'DESC']]
        });

        return menuSections;
    }
}

module.exports = new MenuService();
