const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  table_id: { type: DataTypes.INTEGER, allowNull: true },
  table_number: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  note: { type: DataTypes.STRING, allowNull: true },
  subtotal_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  voucher_id: { type: DataTypes.INTEGER, allowNull: true },
  user_voucher_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Order;
