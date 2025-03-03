// Import dotenv and load environment variables from .env file
require("dotenv").config();

const { Pool } = require("pg");
const { databaseUrl } = require("../settings");

const proConfig = {
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create a PostgreSQL connection pool
const pool = new Pool(proConfig);

async function createWarnUsersTable() {
  const client = await pool.connect();
  try {
    // Execute SQL query to create "warn_users" table if it doesn't exist
    const query = `
      CREATE TABLE IF NOT EXISTS warn_users (
        jid text PRIMARY KEY,
        warn_count integer DEFAULT 0
      );
    `;
    await client.query(query);
    console.log("The 'warn_users' table has been created successfully.");
  } catch (error) {
    console.error("Error while creating the 'warn_users' table:", error);
  } finally {
    client.release();
  }
}
createWarnUsersTable();

async function addUserWithWarnCount(jid) {
  const client = await pool.connect();
  try {
    // Execute SQL query to add or update the user
    const query = `
      INSERT INTO warn_users (jid, warn_count)
      VALUES ($1, 1)
      ON CONFLICT (jid)
      DO UPDATE SET warn_count = warn_users.warn_count + 1;
    `;
    const values = [jid];

    await client.query(query, values);
    console.log(`User ${jid} added or updated with a warn_count of 1.`);
  } catch (error) {
    console.error("Error while adding or updating the user:", error);
  } finally {
    client.release();
  }
}

async function getWarnCountByJID(jid) {
  const client = await pool.connect();
  try {
    // Execute SQL query to retrieve the warn_count by JID
    const query = "SELECT warn_count FROM warn_users WHERE jid = $1";
    const values = [jid];

    const result = await client.query(query, values);
    if (result.rows.length > 0) {
      const warnCount = result.rows[0].warn_count;
      return warnCount;
    } else {
      // If the user is not found, return 0 or another default value
      return 0;
    }
  } catch (error) {
    console.error("Error while retrieving the warn_count:", error);
    return -1; // Return an error value or another default value in case of an error
  } finally {
    client.release();
  }
}

async function resetWarnCountByJID(jid) {
  const client = await pool.connect();
  try {
    // Execute SQL query to reset the warn_count to 0 for the specified JID
    const query = "UPDATE warn_users SET warn_count = 0 WHERE jid = $1";
    const values = [jid];

    await client.query(query, values);
    console.log(`The warn_count for user ${jid} has been reset to 0.`);
  } catch (error) {
    console.error("Error while resetting the warn_count:", error);
  } finally {
    client.release();
  }
}

module.exports = {
  addUserWithWarnCount,
  getWarnCountByJID,
  resetWarnCountByJID,
};
