const { MongoClient } = require('mongodb');
require('dotenv').config()

const state = { db: null }
// Replace with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI
const DATABASE_NAME = process.env.DB_NAME

// Create a MongoDB client
const client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports.connect = async () => {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB successfully');

    // Select the database
    const db = client.db(DATABASE_NAME);
    console.log(`Using database: ${DATABASE_NAME}`);
    state.db = db

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

module.exports.get = () => {
  return state.db;
};
