/**
 * Product Controller
 * HTTP layer - handles requests and responses
 */

const productService = require('../services/productService');
const { success, error, created, paginated } = require('../utils/responseFormatter');
const upload = require('../middleware/uploadMiddleware');

exports.uploadMedia = upload.single('image');

const buildProductPayload = (req) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.image_url = req.file.path;
  }
  return payload;
};

/**
 * Create new product
 */
exports.create = async (req, res) => {
  try {
    const product = await productService.createProduct(buildProductPayload(req));
    res.status(201).json(created(product, 'Product created successfully'));
  } catch (err) {
    if (err.message.includes('required') || err.message.includes('must be')) {
      return res.status(400).json(error(err.message, 400));
    }
    res.status(500).json(error('Create product error', 500, err.message));
  }
};

/**
 * Get all products
 */
exports.list = async (req, res) => {
  try {
    const { category, search, page, limit, isAvailable } = req.query;
    const result = await productService.getAllProducts({
      category,
      search,
      page,
      limit,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined
    });

    res.json(paginated(
      result.products,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    ));
  } catch (err) {
    res.status(500).json(error('List products error', 500, err.message));
  }
};

/**
 * Get product by ID
 */
exports.get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid product ID', 400));
    }

    const product = await productService.getProductById(id);
    res.json(success(product));
  } catch (err) {
    if (err.message === 'Product not found') {
      return res.status(404).json(error('Product not found', 404));
    }
    res.status(500).json(error('Get product error', 500, err.message));
  }
};

/**
 * Update product
 */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid product ID', 400));
    }

    const product = await productService.updateProduct(id, buildProductPayload(req));
    res.json(success(product, 'Product updated successfully'));
  } catch (err) {
    if (err.message === 'Product not found') {
      return res.status(404).json(error('Product not found', 404));
    }
    if (err.message.includes('must be')) {
      return res.status(400).json(error(err.message, 400));
    }
    res.status(500).json(error('Update product error', 500, err.message));
  }
};

/**
 * Delete product
 */
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid product ID', 400));
    }

    await productService.deleteProduct(id);
    res.json(success(null, 'Product deleted successfully'));
  } catch (err) {
    if (err.message === 'Product not found') {
      return res.status(404).json(error('Product not found', 404));
    }
    res.status(500).json(error('Delete product error', 500, err.message));
  }
};

/**
 * Toggle product availability
 */
exports.toggleAvailability = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid product ID', 400));
    }

    const product = await productService.toggleAvailability(id);
    res.json(success(product, 'Product availability toggled successfully'));
  } catch (err) {
    if (err.message === 'Product not found') {
      return res.status(404).json(error('Product not found', 404));
    }
    res.status(500).json(error('Toggle availability error', 500, err.message));
  }
};

/**
 * Get product statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const stats = await productService.getProductStatistics();
    res.json(success(stats));
  } catch (err) {
    res.status(500).json(error('Get statistics error', 500, err.message));
  }
};
