const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local',
  password: 'postgres',
  port: 5432, 
});

// Export the pool
module.exports = pool;
