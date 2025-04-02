// SQL Server configuration
module.exports = {
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'KnittingHavenDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};