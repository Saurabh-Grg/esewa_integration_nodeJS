const { DataTypes } = require('sequelize');
const sequelize = require('../dbConfig/db'); // Importing the Sequelize instance
const Item = require('./itemModel'); // Importing the Item model to reference it

const PurchasedItem = sequelize.define('PurchasedItem', {
  purchasedItemId: {
    type: DataTypes.STRING,
    primaryKey: true,  // Define purchasedItemId as primary key
    autoIncrement: true, // Auto incrementing primary key
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false, // Total price is required
  },
  purchaseDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Defaults to the current date
  },
  paymentMethod: {
    type: DataTypes.ENUM('esewa', 'khalti'),
    allowNull: false, // Payment method is required
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'refunded'),
    defaultValue: 'pending', // Default status is "pending"
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// purchasedItemModel.js
PurchasedItem.belongsTo(Item, {
  foreignKey: 'itemId', // Correct foreign key field
  allowNull: false, // Foreign key cannot be null
  onDelete: 'CASCADE',
});

module.exports = PurchasedItem;
