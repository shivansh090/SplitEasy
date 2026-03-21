const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { mongoUri, useDB } = require('./env');

let mongod = null;

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
    const dbPath = path.resolve(__dirname, '../../.data/db');
    fs.mkdirSync(dbPath, { recursive: true });

    // Remove stale lock if previous process crashed
    const lockFile = path.join(dbPath, 'mongod.lock');
    try { fs.writeFileSync(lockFile, ''); } catch { /* ignore */ }

    mongod = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`Local MongoDB started (data persisted in ${dbPath})`);
  }
};

// Cleanup on exit / nodemon restart
const cleanup = async () => {
  if (mongod) {
    await mongoose.disconnect();
    await mongod.stop();
    mongod = null;
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGUSR2', async () => {
  // nodemon restart signal
  if (mongod) {
    await mongoose.disconnect();
    await mongod.stop();
    mongod = null;
  }
  process.kill(process.pid, 'SIGUSR2');
});

module.exports = connectDB;
