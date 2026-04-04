const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');

exports.create = async (req, res) => {
  try {
    const { order_id, amount, method, status, transaction_id } = req.body;
    if (!order_id || typeof amount !== 'number') return res.status(400).json({ message: 'order_id and numeric amount are required' });
    const item = await Payment.create({ order_id, amount, method: method ?? 'cash', status: status ?? 'pending', transaction_id: transaction_id ?? null });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Create payment error', error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { order_id } = req.query;
    const where = {};
    if (order_id) where.order_id = Number(order_id);

    // Lấy payments đơn giản trước, không join
    const items = await Payment.findAll({
      where,
      order: [['id', 'DESC']]
    });

    res.json(items);
  } catch (err) {
    console.error('❌ Payment list error:', err);
    res.status(500).json({ message: 'List payments error', error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid id' });
    const item = await Payment.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Get payment error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid id' });
    const item = await Payment.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    const { amount, method, status, transaction_id } = req.body;
    await item.update({
      amount: typeof amount === 'number' ? amount : item.amount,
      method: method ?? item.method,
      status: status ?? item.status,
      transaction_id: transaction_id ?? item.transaction_id,
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Update payment error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid id' });
    const item = await Payment.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Delete payment error', error: err.message });
  }
};
