const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.CA_CERT ? {
    ca: Buffer.from(process.env.CA_CERT, 'base64')
  } : process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

module.exports = pool;