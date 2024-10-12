import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { listingId, message } = await request.json();

    const newMessage = {
      listingId: new ObjectId(listingId),
      senderId: new ObjectId(user.id),
      senderName: user.name,
      content: message,
      timestamp: new Date()
    };

    await db.collection('messages').insertOne(newMessage);

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
