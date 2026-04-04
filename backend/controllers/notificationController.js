const BaseController = require('./BaseController');
const Notification = require('../models/notification');

class NotificationController extends BaseController {
  constructor() {
    super(Notification, 'Notification');
  }

  // Override create method để thêm logic đặc biệt
  async create(req, res) {
    try {
      const { title, message, type, user_id, read } = req.body;

      if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required' });
      }

      const item = await this.model.create({
        title,
        message,
        type: type || null,
        user_id: user_id || null,
        read: read || false
      });

      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({
        message: 'Create notification error',
        error: err.message
      });
    }
  }

  // Override update method để xử lý đặc biệt
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const item = await this.model.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      const { title, message, type, read } = req.body;
      await item.update({
        title: title || item.title,
        message: message || item.message,
        type: type || item.type,
        read: typeof read === 'boolean' ? read : item.read,
      });

      res.json(item);
    } catch (err) {
      res.status(500).json({
        message: 'Update notification error',
        error: err.message
      });
    }
  }
}

const notificationController = new NotificationController();

module.exports = {
  create: notificationController.create.bind(notificationController),
  list: notificationController.list.bind(notificationController),
  get: notificationController.get.bind(notificationController),
  update: notificationController.update.bind(notificationController),
  remove: notificationController.remove.bind(notificationController)
};

