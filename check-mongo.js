import { MongoClient } from 'mongodb';

async function checkMongoDB() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.log('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

checkMongoDB();
