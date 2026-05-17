const News = require('../models/news');
const User = require('../models/user');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { cloudinary } = require('../config/cloudinary');

// Validation schema for create/update
const newsSchema = {
  title: { required: true, type: 'string', minLength: 5, maxLength: 255 },
  content: { required: true, type: 'string', minLength: 10 },
  status: { type: 'string', enum: ['draft', 'published', 'archived'] }
};

const resolveImageUrl = async (req) => {
  if (req.file) {
    return req.file.path;
  }

  const imageSource = req.body.image_url || req.body.image || req.body.img;
  if (!imageSource) {
    return undefined;
  }

  if (typeof imageSource === 'string' && imageSource.startsWith('data:image')) {
    const uploadResponse = await cloudinary.v2.uploader.upload(imageSource, {
      folder: 'cafe_app_uploads',
    });
    return uploadResponse.secure_url;
  }

  return imageSource;
};

const newController = {
  // Get all news (with pagination)
  async list(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const { count, rows } = await News.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        }]
      });

      res.json({
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({
        message: 'Error fetching news',
        error: error.message,
        stack: error.stack
      });
    }
  },

  // Get single news by ID
  async get(req, res) {
    try {
      const news = await News.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        }]
      });

      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ message: 'Error fetching news' });
    }
  },

  // Create new news article
  async create(req, res) {
    try {
      const { title, status = 'draft' } = req.body;
      const content = req.body.content || req.body.excerpt;
      const userId = req.user.id;
      const finalImageUrl = await resolveImageUrl(req);

      const news = await News.create({
        title,
        content,
        status,
        created_by: userId,
        image_url: finalImageUrl || null
      });

      res.status(201).json(news);
    } catch (error) {
      console.error('Error creating news:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Error creating news', error: error.message });
    }
  },

  // Update news article
  async update(req, res) {
    try {
      const { title, status } = req.body;
      const content = req.body.content || req.body.excerpt;
      const news = await News.findByPk(req.params.id);

      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      // Check if user is the author or admin
      if (news.created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this news' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (status !== undefined) updateData.status = status;
      if (req.body.is_pinned !== undefined) updateData.is_pinned = req.body.is_pinned;

      const finalImageUrl = await resolveImageUrl(req);
      if (finalImageUrl !== undefined) updateData.image_url = finalImageUrl;

      await news.update(updateData);
      res.json(news);
    } catch (error) {
      console.error('Error updating news:', error);
      res.status(500).json({ message: 'Error updating news' });
    }
  },

  // Delete news article
  async remove(req, res) {
    try {
      const news = await News.findByPk(req.params.id);

      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      // Only admin or the author can delete
      if (news.created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this news' });
      }

      await news.destroy();
      res.json({ message: 'News deleted successfully' });
    } catch (error) {
      console.error('Error deleting news:', error);
      res.status(500).json({ message: 'Error deleting news' });
    }
  },

  // Upload image for news
  uploadImage: upload.single('image')
};

module.exports = newController;
