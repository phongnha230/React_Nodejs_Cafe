const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.ENUM('cash', 'momo', 'vnpay', 'mono', 'card', 'online'), allowNull: false, defaultValue: 'cash' },
  status: { type: DataTypes.ENUM('pending', 'completed', 'success', 'failed'), defaultValue: 'pending' },
  transaction_id: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'payments',
  timestamps: true, // Bật timestamps để có createdAt và updatedAt
  underscored: true, // Tự động chuyển camelCase sang snake_case trong DB
});

module.exports = Payment;
