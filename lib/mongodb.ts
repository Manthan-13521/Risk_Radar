import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

// Global caching for MongoClient promise across serverless / Next.js function invocations
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  console.warn('[ShieldSense/DB] Warning: MONGODB_URI is not set in environment.');
}

if (!globalWithMongo._mongoClientPromise) {
  if (uri) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  } else {
    // Graceful fallback promise if URI is missing
    globalWithMongo._mongoClientPromise = Promise.reject(new Error('MONGODB_URI missing'));
  }
}

const clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}
