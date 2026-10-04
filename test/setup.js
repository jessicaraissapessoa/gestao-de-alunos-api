import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
let mongo;
// Banco exclusivo por execução: os dados da aplicação não são alterados.
if (process.env.TEST_MONGODB_URI) {
  const uri = new URL(process.env.TEST_MONGODB_URI);
  uri.pathname = `/gestao-test-${Date.now()}-${process.pid}`;
  process.env.MONGODB_URI = uri.toString();
} else {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
}
export const mochaHooks = {
  async afterAll() {
    try {
      if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
    } finally {
      await mongoose.disconnect();
      if (mongo) await mongo.stop();
    }
  },
};
