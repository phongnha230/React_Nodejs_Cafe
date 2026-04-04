const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuSection = sequelize.define('MenuSection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'menu_sections',
  timestamps: false,
});

module.exports = MenuSection;
