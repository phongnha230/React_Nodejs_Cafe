/**
 * User Controller
 * HTTP layer - handles requests and responses
 */

const userService = require('../services/userService');
const { success, error, paginated } = require('../utils/responseFormatter');

/**
 * Get all users
 */
exports.list = async (req, res) => {
  try {
    const { page, limit, role } = req.query;
    const result = await userService.getAllUsers({ page, limit, role });

    res.json(paginated(result.users, result.pagination.page, result.pagination.limit, result.pagination.total));
  } catch (err) {
    res.status(500).json(error('List users error', 500, err.message));
  }
};

/**
 * Create user (admin only)
 */
exports.create = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(success(user, 'User created successfully'));
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(400).json(error(err.message, 400));
    }
    res.status(500).json(error('Create user error', 500, err.message));
  }
};

/**
 * Get user by ID
 */
exports.get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid user ID', 400));
    }

    const user = await userService.getUserById(id);
    res.json(success(user));
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json(error('User not found', 404));
    }
    res.status(500).json(error('Get user error', 500, err.message));
  }
};

/**
 * Update user
 */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid user ID', 400));
    }

    const user = await userService.updateUser(id, req.body);
    res.json(success(user, 'User updated successfully'));
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json(error('User not found', 404));
    }
    if (err.message.includes('already exists')) {
      return res.status(400).json(error(err.message, 400));
    }
    res.status(500).json(error('Update user error', 500, err.message));
  }
};

/**
 * Delete user
 */
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid user ID', 400));
    }

    await userService.deleteUser(id);
    res.json(success(null, 'User deleted successfully'));
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json(error('User not found', 404));
    }
    res.status(500).json(error('Delete user error', 500, err.message));
  }
};
