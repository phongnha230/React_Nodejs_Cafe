const logger = require('../config/logger');

class BaseController {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  // Tạo mới record
  async create(req, res) {
    try {
      const data = req.body;
      const item = await this.model.create(data);

      logger.info(`${this.modelName} created`, {
        id: item.id,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(item);
    } catch (err) {
      logger.error(`Error creating ${this.modelName}`, {
        error: err.message,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: `Create ${this.modelName} error`,
        error: err.message
      });
    }
  }

  // Lấy danh sách với pagination
  async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await this.model.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']]
      });

      res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      logger.error(`Error listing ${this.modelName}`, {
        error: err.message,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: `List ${this.modelName} error`,
        error: err.message
      });
    }
  }

  // Lấy theo ID
  async get(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      res.json(item);
    } catch (err) {
      logger.error(`Error getting ${this.modelName}`, {
        error: err.message,
        id: req.params.id,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: `Get ${this.modelName} error`,
        error: err.message
      });
    }
  }

  // Cập nhật
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      const data = req.body;
      await item.update(data);

      logger.info(`${this.modelName} updated`, {
        id: item.id,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      res.json(item);
    } catch (err) {
      logger.error(`Error updating ${this.modelName}`, {
        error: err.message,
        id: req.params.id,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: `Update ${this.modelName} error`,
        error: err.message
      });
    }
  }

  // Xóa
  async remove(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: `${this.modelName} not found` });
      }

      await item.destroy();

      logger.info(`${this.modelName} deleted`, {
        id: item.id,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true });
    } catch (err) {
      logger.error(`Error deleting ${this.modelName}`, {
        error: err.message,
        id: req.params.id,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: `Delete ${this.modelName} error`,
        error: err.message
      });
    }
  }
}

module.exports = BaseController;
