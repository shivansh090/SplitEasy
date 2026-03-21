const mongoose = require('mongoose');
const { mongoUri, useDB } = require('./env');

const connectDB = async () => {
  if (useDB) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  } else {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('In-memory MongoDB started (data will not persist across restarts)');
  }
};

module.exports = connectDB;
