import { MongoClient, Db } from 'mongodb';

const options = {};

// Global caching for MongoClient promise across serverless / Next.js function invocations
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI || '';
  if (!globalWithMongo._mongoClientPromise) {
    if (uri) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    } else {
      globalWithMongo._mongoClientPromise = Promise.reject(new Error('MONGODB_URI missing'));
    }
  }
  return globalWithMongo._mongoClientPromise;
}

const clientPromise = {
  then<TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return getClientPromise().then(onfulfilled, onrejected);
  },
  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ) {
    return getClientPromise().catch(onrejected);
  },
};

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db();
}
