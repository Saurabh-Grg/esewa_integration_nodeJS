// db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create a Sequelize instance and configure the connection
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // Database user
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST,     // Database host
    dialect: process.env.DB_DIALECT, // Dialect: mysql
    logging: false, // Disable logging of queries (optional)
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;