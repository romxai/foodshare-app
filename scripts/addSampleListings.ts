import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

async function addSampleListings() {
  const { db } = await connectToDatabase();

  const sampleListings = [
    {
      foodType: 'Pizza',
      description: 'Leftover pizza from office party',
      quantity: '5 boxes',
      expiration: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'New York, NY',
      postedBy: new ObjectId(), // You might want to use actual user IDs here
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    },
    {
      foodType: 'Apples',
      description: 'Fresh apples from local orchard',
      quantity: '20 lbs',
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Los Angeles, CA',
      postedBy: new ObjectId(), // You might want to use actual user IDs here
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    },
    // Add more sample listings as needed
  ];

  try {
    const result = await db.collection('foodlistings').insertMany(sampleListings);
    console.log(`${result.insertedCount} sample listings added successfully`);
  } catch (error) {
    console.error('Error adding sample listings:', error);
  }
}

addSampleListings();
