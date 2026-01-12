// db.js - AWS Lambda database connection
// Note: Store credentials in AWS Secrets Manager for production

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,          // keep small for Lambda
  idleTimeoutMillis: 30000,
  ssl: {
    require: true,
    rejectUnauthorized: true // use RDS CA bundle in production if needed
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
