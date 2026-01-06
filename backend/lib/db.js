import serverlessMysql from "serverless-mysql";
import mysql2 from "mysql2";

const db = serverlessMysql({
  library: mysql2, 
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  },
});

//connection test (will run on first query)
async function testConnection() {
  try {
    await db.query("SELECT 1");
    console.log("Database Connected");
  } catch (err) {
    console.error("Database Connection Failed:", err);
  }
}
testConnection();

export default async function executeQuery({ query, values }) {
  try {
    const results = await db.query(query, values);
    return results;
  } catch (error) {
    console.error("DB Query Error:", error);
    return { error };
  }
}
