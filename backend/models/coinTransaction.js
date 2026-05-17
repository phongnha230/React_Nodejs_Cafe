const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoinTransaction = sequelize.define('CoinTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  review_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'coin_transactions',
  timestamps: false,
});

module.exports = CoinTransaction;
