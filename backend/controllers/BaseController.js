const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const { success, paginated } = require('../utils/responseFormatter');

/**
 * Base Controller
 * Provides common CRUD operations for models
 */
class BaseController {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  /**
   * Create new record
   */
  async create(req, res, next) {
    try {
      const data = req.body;
      const item = await this.model.create(data);

      logger.info(`${this.modelName} created`, {
        id: item.id,
        userId: req.user?.id
      });

      res.status(201).json(success(item, `${this.modelName} created successfully`));
    } catch (err) {
      next(err);
    }
  }

  /**
   * List records with pagination
   */
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await this.model.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']]
      });

      res.json(paginated(rows, page, limit, count));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get record by ID
   */
  async get(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError('Invalid ID', 400);
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        throw new AppError(`${this.modelName} not found`, 404);
      }

      res.json(success(item));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update record
   */
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError('Invalid ID', 400);
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        throw new AppError(`${this.modelName} not found`, 404);
      }

      const data = req.body;
      await item.update(data);

      logger.info(`${this.modelName} updated`, {
        id: item.id,
        userId: req.user?.id
      });

      res.json(success(item, `${this.modelName} updated successfully`));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Remove record
   */
  async remove(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        throw new AppError('Invalid ID', 400);
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        throw new AppError(`${this.modelName} not found`, 404);
      }

      await item.destroy();

      logger.info(`${this.modelName} deleted`, {
        id: item.id,
        userId: req.user?.id
      });

      res.json(success(null, `${this.modelName} deleted successfully`));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BaseController;
