import { Db, MongoClient } from 'mongodb';

const dbUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const dbPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;
const dbNamespace = process.env.MONGO_INITDB_DATABASE;
const dbHost = process.env.MONGO_HOST;
const dbPort = process.env.MONGO_PORT;

const mongodbUri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}`;

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(mongodbUri);
    await client.connect();
    db = client.db(dbNamespace);
    console.log('Connected to MongoDB');
  }
  return db;
}

export async function closeMongoClient() {
  await client.close();
  console.log('Closed MongoDB connection');
}
