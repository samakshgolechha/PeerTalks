const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase cloud PostgreSQL
      },
    }
  : {
      host: process.env.PGHOST || process.env.DB_HOST || "localhost",
      user: process.env.PGUSER || process.env.DB_USER || "postgres",
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
      port: process.env.PGPORT || process.env.DB_PORT || 5432,
      database: process.env.PGDATABASE || process.env.DB_NAME || "postgres",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  if (!connectionString && !process.env.PGHOST && !process.env.DB_HOST) {
    console.warn("⚠️ DATABASE_URL not yet configured in .env");
    return;
  }
  try {
    const client = await pool.connect();
    console.log("🚀 Connected to Supabase PostgreSQL Database");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
  }
}

testConnection();

/**
 * Executes a query against PostgreSQL with automatic conversion of `?` to `$1, $2, ...`
 */
async function executeQuery(query, values = []) {
  try {
    let paramIndex = 1;
    // Replace ? placeholders with $1, $2, $3...
    const pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);

    const result = await pool.query(pgQuery, values);

    // Map result array so it behaves just like mysql2's results array
    const rows = result.rows || [];
    
    // For INSERT queries with RETURNING, map insertId if chat_id exists
    if (rows.length > 0 && rows[0].chat_id !== undefined) {
      rows.insertId = rows[0].chat_id;
    }
    rows.rowCount = result.rowCount;
    return rows;
  } catch (error) {
    console.error("DB Query Error:", error);
    return { error: error.message };
  }
}

module.exports = {
  pool,
  executeQuery,
};
