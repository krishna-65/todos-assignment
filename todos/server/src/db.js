import mongoose from 'mongoose';

export async function connectDB() {
  let uri = process.env.MONGO_URI;
  let inMemory = false;

  if (!uri) {
    // Zero-config local dev: spin up a throwaway MongoDB
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri('todos');
    inMemory = true;
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB || 'todos', serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    console.error(`\nCould not connect to MongoDB: ${err.message}`);
    if (/alert|ECONNRESET|Server selection timed out/i.test(err.message)) {
      console.error(
        'Hint: if you use MongoDB Atlas, add your IP under Security → Network Access ' +
          '(or allow 0.0.0.0/0 for development), then restart.\n',
      );
    }
    process.exit(1);
  }
  return { inMemory };
}
