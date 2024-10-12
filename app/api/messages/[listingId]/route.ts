import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { listingId: string } }) {
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
    const messages = await db.collection('messages')
      .find({ listingId: new ObjectId(params.listingId) })
      .sort({ timestamp: 1 })
      .toArray();

    const formattedMessages = messages.map(message => ({
      ...message,
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      timestamp: message.timestamp.toISOString()
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
