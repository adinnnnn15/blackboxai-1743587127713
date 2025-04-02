const sql = require('mssql');
const config = require('../dbConfig');

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

async function query(sqlQuery) {
  await poolConnect;
  try {
    const result = await pool.request().query(sqlQuery);
    return result.recordset;
  } catch (err) {
    console.error('SQL error', err);
    throw err;
  }
}

module.exports = {
  query,
  pool
};