// Import dotenv and load environment variables from .env file
require("dotenv").config();

const { MongoClient } = require('mongodb');
const { databaseUrl } = require('../set');

const client = new MongoClient(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createWarnUsersCollection() {
  try {
    await client.connect();
    const db = client.db('mydatabase');
    await db.createCollection('warn_users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['jid', 'warn_count'],
          properties: {
            jid: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            warn_count: {
              bsonType: 'int',
              description: 'must be an integer and is required',
              default: 0,
            },
          },
        },
      },
    });
    console.log("The 'warn_users' collection has been created successfully.");
  } catch (error) {
    console.error("Error while creating the 'warn_users' collection:", error);
  }
}
createWarnUsersCollection();

async function addUserWithWarnCount(jid) {
  try {
    await client.connect();
    const db = client.db('mydatabase');
    const collection = db.collection('warn_users');
    await collection.updateOne(
      { jid },
      { $inc: { warn_count: 1 } },
      { upsert: true }
    );
    console.log(`User ${jid} added or updated with a warn_count of 1.`);
  } catch (error) {
    console.error("Error while adding or updating the user:", error);
  }
}

async function getWarnCountByJID(jid) {
  try {
    await client.connect();
    const db = client.db('mydatabase');
    const collection = db.collection('warn_users');
    const user = await collection.findOne({ jid });
    return user ? user.warn_count : 0;
  } catch (error) {
    console.error("Error while retrieving the warn_count:", error);
    return -1;
  }
}

async function resetWarnCountByJID(jid) {
  try {
    await client.connect();
    const db = client.db('mydatabase');
    const collection = db.collection('warn_users');
    await collection.updateOne(
      { jid },
      { $set: { warn_count: 0 } }
    );
    console.log(`The warn_count for user ${jid} has been reset to 0.`);
  } catch (error) {
    console.error("Error while resetting the warn_count:", error);
  }
}

module.exports = {
  addUserWithWarnCount,
  getWarnCountByJID,
  resetWarnCountByJID,
};
