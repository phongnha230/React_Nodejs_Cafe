const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Table = sequelize.define('Table', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  table_number: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'inactive'),
    allowNull: false,
    defaultValue: 'available',
  },
}, {
  tableName: 'tables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Table;
