import { connectToDatabase } from './mongodb';

export async function checkCollectionContents() {
  try {
    const db = await connectToDatabase();

    const collections = await db.listCollections().toArray();
    console.log('Collections in the database:', collections);

    const collection = db.collection('testCollection');
    const contents = await collection.find({}).toArray();
    console.log('COLLECTIONCONTENTS', contents);
  } catch (err) {
    console.error(err);
  }
}
