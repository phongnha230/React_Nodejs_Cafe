const MenuSection = require('../models/menuSection');

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const item = await MenuSection.create({ name, description: description ?? null });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Create menu section error', error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const items = await MenuSection.findAll({ order: [['id', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'List menu sections error', error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid id' });
    const item = await MenuSection.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Get menu section error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid id' });
    const item = await MenuSection.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    const { name, description } = req.body;
    await item.update({ name: name ?? item.name, description: description ?? item.description });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Update menu section error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid id' });
    const item = await MenuSection.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Delete menu section error', error: err.message });
  }
};

