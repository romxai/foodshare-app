import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
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
    const userData = await db.collection('users').findOne({ _id: new ObjectId(user.id) });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: userData._id,
      name: userData.name,
      email: userData.email,
      location: userData.location
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const { action, data } = await request.json();

    switch (action) {
      case 'updateEmail':
        await db.collection('users').updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { email: data.email } }
        );
        return NextResponse.json({ message: 'Email updated successfully' });

      case 'updatePassword':
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await db.collection('users').updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { password: hashedPassword } }
        );
        return NextResponse.json({ message: 'Password updated successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
