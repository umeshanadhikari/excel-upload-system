const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

// SQL Server configuration for SQL Server Authentication
const config = {
  server: 'localhost\\SQLEXPRESS', // Use the correct SQL Server instance name
  database: 'SalesAnalyserDB', // Database name
  user: 'app_user', // SQL Server username
  password: 'Pa$$word', // SQL Server password
  options: {
    encrypt: false, // Set to true if using Azure SQL or encryption
    enableArithAbort: true,
    trustServerCertificate: true, // Fixes SSL issues
  },
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    idleTimeoutMillis: 600000, // Close idle connections after 30 seconds
  },
  requestTimeout: 300000, // Increase request timeout to 5 minutes
  connectionTimeout: 300000, // Increase connection timeout to 5 minutes
};

// Create connection pool with better error handling
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('✅ Connected to SQL Server database successfully!');
    return pool;
  })
  .catch((err) => {
    console.error('❌ Database connection failed!');
    console.error('🔴 ERROR MESSAGE:', err.message);
    console.error('📌 STACK TRACE:', err.stack);

    // Log additional error details if available
    if (err.code) {
      console.error('🔍 ERROR CODE:', err.code);
    }
    if (err.serverName) {
      console.error('🔍 SERVER NAME:', err.serverName);
    }
    if (err.procName) {
      console.error('🔍 PROCEDURE NAME:', err.procName);
    }
    if (err.lineNumber) {
      console.error('🔍 LINE NUMBER:', err.lineNumber);
    }

    console.error('🔍 DEBUG INFO:', {
      server: config.server,
      database: config.database,
    });

    process.exit(1); // Exit process if DB connection fails
  });

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err);
  process.exit(1);
});

module.exports = poolPromise;