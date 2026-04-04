const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductMenuSection = sequelize.define('ProductMenuSection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  section_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'product_menu_section',
  timestamps: false,
});

module.exports = ProductMenuSection;
