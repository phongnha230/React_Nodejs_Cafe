const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM('coin_exchange', 'direct'),
    allowNull: false,
    defaultValue: 'direct',
  },
  discount_type: {
    type: DataTypes.ENUM('percent', 'fixed'),
    allowNull: false,
  },
  discount_value: { type: DataTypes.INTEGER, allowNull: false },
  coin_cost: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  min_order_amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  max_discount_amount: { type: DataTypes.INTEGER, allowNull: true },
  usage_limit: { type: DataTypes.INTEGER, allowNull: true },
  used_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  start_at: { type: DataTypes.DATE, allowNull: true },
  end_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'vouchers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Voucher;
