const mysql = require('mysql2/promise');
require('dotenv').config();

const getSslConfig = () => {
  if (process.env.CA_CERT) {
    return { ca: Buffer.from(process.env.CA_CERT) };
  }
  if (process.env.DB_SSL === 'true') {
    const fs = require('fs');
    const path = require('path');
    return { ca: fs.readFileSync(path.join(__dirname, '../../ca.pem')) };
  }
  return false;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: getSslConfig(),
});

module.exports = pool;