// models/itemModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Importing the Sequelize instance

const Item = sequelize.define('Item', {
  itemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,  // Define itemId as primary key
    autoIncrement: true, // Auto incrementing primary key
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Name is required
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false, // Price is required
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Default value is true (in stock)
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true, // Category is optional
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = Item;
