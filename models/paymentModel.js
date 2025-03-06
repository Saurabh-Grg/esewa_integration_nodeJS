// // models/paymentModel.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../dbConfig/db'); // Importing the Sequelize instance
// const PurchasedItem = require('../purchasedItemModel'); // Importing the PurchasedItem model to reference it

// const Payment = sequelize.define('Payment', {
//   paymentId: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,  // Define paymentId as primary key
//     autoIncrement: true, // Auto incrementing primary key
//   },
//   transactionId: {
//     type: DataTypes.STRING,
//     unique: true, // Transaction ID must be unique
//     allowNull: true,
//   },
//   pidx: {
//     type: DataTypes.STRING,
//     unique: true, // Payment ID must be unique
//     allowNull: true,
//   },
//   amount: {
//     type: DataTypes.FLOAT,
//     allowNull: false, // Amount is required
//   },
//   dataFromVerificationReq: {
//     type: DataTypes.JSONB, // Store as JSON
//     allowNull: true, // Optional field
//   },
//   apiQueryFromUser: {
//     type: DataTypes.JSONB, // Store as JSON
//     allowNull: true, // Optional field
//   },
//   paymentGateway: {
//     type: DataTypes.ENUM('khalti', 'esewa', 'connectIps'),
//     allowNull: false, // Payment gateway is required
//   },
//   status: {
//     type: DataTypes.ENUM('success', 'pending', 'failed'),
//     defaultValue: 'pending', // Default status is "pending"
//   },
//   paymentDate: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW, // Defaults to the current date
//   },
// }, {
//   timestamps: true, // Automatically adds createdAt and updatedAt fields
// });


// // Define Associations with Explicit Foreign Key Naming
// PurchasedItem.hasOne(Payment, { 
//     foreignKey: 'purchasedItemId' // Ensuring Sequelize does not create a weird foreign key
//   });
  
//   Payment.belongsTo(PurchasedItem, {
//     foreignKey: 'purchasedItemId',  // Explicitly defining the correct foreign key
//     onDelete: 'CASCADE', 
//   });

  
// module.exports = Payment;


const { DataTypes } = require('sequelize');
const sequelize = require('../dbConfig/db'); // Importing the Sequelize instance
const PurchasedItem = require('../models/purchasedItemModel'); // Importing the PurchasedItem model to reference it

const Payment = sequelize.define('Payment', {
  paymentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,  // Define paymentId as primary key
    autoIncrement: true, // Auto incrementing primary key
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true, // Transaction ID must be unique
    allowNull: true,
  },
  pidx: {
    type: DataTypes.STRING,
    unique: true, // Payment ID must be unique
    allowNull: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false, // Amount is required
  },
  dataFromVerificationReq: {
    type: DataTypes.JSONB, // Store as JSON
    allowNull: true, // Optional field
  },
  apiQueryFromUser: {
    type: DataTypes.JSONB, // Store as JSON
    allowNull: true, // Optional field
  },
  paymentGateway: {
    type: DataTypes.ENUM('khalti', 'esewa', 'connectIps'),
    allowNull: false, // Payment gateway is required
  },
  status: {
    type: DataTypes.ENUM('success', 'pending', 'failed'),
    defaultValue: 'pending', // Default status is "pending"
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Defaults to the current date
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Define Associations with Explicit Foreign Key Naming
PurchasedItem.hasOne(Payment, { foreignKey: 'purchasedItemId' });

Payment.belongsTo(PurchasedItem, {
  foreignKey: 'purchasedItemId',
  onDelete: 'CASCADE',
});

module.exports = Payment;
