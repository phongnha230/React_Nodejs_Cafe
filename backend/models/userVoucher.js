const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserVoucher = sequelize.define('UserVoucher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  voucher_id: { type: DataTypes.INTEGER, allowNull: false },
  is_used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  used_order_id: { type: DataTypes.INTEGER, allowNull: true },
  used_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'user_vouchers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserVoucher;
