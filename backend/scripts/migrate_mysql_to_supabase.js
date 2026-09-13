const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mysql = require("mysql2/promise");
const { Pool } = require("pg");

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
    console.error("❌ Please set a valid DATABASE_URL in backend/.env before running migration.");
    process.exit(1);
  }

  console.log("🔄 Starting migration from MySQL to Supabase PostgreSQL...\n");

  // 1. Connect to MySQL
  const mysqlConn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || "PeerTalks",
  });
  console.log("✅ Connected to source MySQL database");

  // 2. Connect to Supabase PostgreSQL
  const pgPool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const pgClient = await pgPool.connect();
  console.log("✅ Connected to target Supabase PostgreSQL database\n");

  try {
    // 3. Apply schema.sql
    console.log("📋 Applying schema.sql to Supabase...");
    const schemaSql = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf-8");
    await pgClient.query(schemaSql);
    console.log("✅ PostgreSQL schema ready.\n");

    // Helper to format date strings
    const toIsoOrNull = (val) => (val ? new Date(val).toISOString() : null);

    // 4. Migrate USERS
    console.log("📦 Migrating USERS...");
    const [users] = await mysqlConn.query("SELECT * FROM USERS");
    for (const u of users) {
      await pgClient.query(
        `INSERT INTO users (
          username, password, email, phone, password_hash, auth_provider,
          provider_id, email_verified, failed_login_attempts, account_locked_until,
          last_seen, fname, lname, bio, gender, DOB, lastLogin, regDate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password,
          password_hash = EXCLUDED.password_hash,
          email = EXCLUDED.email,
          fname = EXCLUDED.fname,
          lname = EXCLUDED.lname,
          last_seen = EXCLUDED.last_seen`,
        [
          u.username,
          u.password,
          u.email,
          u.phone,
          u.password_hash,
          u.auth_provider || "local",
          u.provider_id,
          Boolean(u.email_verified),
          u.failed_login_attempts || 0,
          toIsoOrNull(u.account_locked_until),
          toIsoOrNull(u.last_seen),
          u.fname,
          u.lname,
          u.bio,
          u.gender,
          u.DOB,
          toIsoOrNull(u.lastLogin),
          toIsoOrNull(u.regDate),
        ]
      );
    }
    console.log(`✅ Migrated ${users.length} users.`);

    // 5. Migrate CHATS
    console.log("📦 Migrating CHATS...");
    const [chats] = await mysqlConn.query("SELECT * FROM CHATS");
    for (const c of chats) {
      await pgClient.query(
        `INSERT INTO chats (chat_id, create_time)
         VALUES ($1, $2)
         ON CONFLICT (chat_id) DO NOTHING`,
        [c.chat_id, toIsoOrNull(c.create_time)]
      );
    }
    console.log(`✅ Migrated ${chats.length} chats.`);

    // 6. Migrate CONTACT
    console.log("📦 Migrating CONTACT...");
    const [contacts] = await mysqlConn.query("SELECT * FROM CONTACT");
    for (const ct of contacts) {
      await pgClient.query(
        `INSERT INTO contact (username, contactname, chat_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (username, contactname) DO UPDATE SET chat_id = EXCLUDED.chat_id`,
        [ct.username, ct.contactname, ct.chat_id]
      );
    }
    console.log(`✅ Migrated ${contacts.length} contacts.`);

    // 7. Migrate MESSAGE
    console.log("📦 Migrating MESSAGE...");
    const [messages] = await mysqlConn.query("SELECT * FROM MESSAGE");
    for (const m of messages) {
      await pgClient.query(
        `INSERT INTO message (chat_id, sender, content, time, seen)
         VALUES ($1, $2, $3, $4, $5)`,
        [m.chat_id, m.sender, m.content, toIsoOrNull(m.time), Boolean(m.seen)]
      );
    }
    console.log(`✅ Migrated ${messages.length} messages.`);

    // 8. Migrate NOTIFICATIONS
    console.log("📦 Migrating NOTIFICATIONS...");
    const [notifications] = await mysqlConn.query("SELECT * FROM NOTIFICATIONS");
    for (const n of notifications) {
      await pgClient.query(
        `INSERT INTO notifications (username, senderuser, message, time)
         VALUES ($1, $2, $3, $4)`,
        [n.username, n.senderuser, n.message, toIsoOrNull(n.time)]
      );
    }
    console.log(`✅ Migrated ${notifications.length} notifications.`);

    // 9. Migrate FRIENDREQUEST
    console.log("📦 Migrating FRIENDREQUEST...");
    const [friendrequests] = await mysqlConn.query("SELECT * FROM FRIENDREQUEST");
    for (const fr of friendrequests) {
      await pgClient.query(
        `INSERT INTO friendrequest (sender, receiver, time)
         VALUES ($1, $2, $3)
         ON CONFLICT (sender, receiver) DO NOTHING`,
        [fr.sender, fr.receiver, toIsoOrNull(fr.time)]
      );
    }
    console.log(`✅ Migrated ${friendrequests.length} friend requests.`);

    // 10. Sync chat_id sequence
    console.log("🔧 Syncing PostgreSQL auto-increment sequence...");
    await pgClient.query(`
      SELECT setval(
        pg_get_serial_sequence('chats', 'chat_id'),
        COALESCE((SELECT MAX(chat_id) FROM chats), 1)
      );
    `);
    console.log("✅ Sequence synced.");

    console.log("\n🎉 Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await mysqlConn.end();
    pgClient.release();
    await pgPool.end();
  }
}

migrate();
