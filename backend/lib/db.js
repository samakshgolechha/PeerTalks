const mysql = require("mysql2/promise");

console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database Connected");
  } catch (err) {
    console.error("Database Connection Failed:", err.message);
  }
}

async function executeQuery(query, values = []) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error("DB Query Error:", error);
    return { error: error.message };
  }
}

testConnection();

module.exports = {
  executeQuery,
};
