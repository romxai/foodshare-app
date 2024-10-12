import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, location } = await request.json();

    console.log('Received signup attempt:', { name, email, location });

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();

    // Create new user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      location,
      createdAt: now,
      updatedAt: now,
      __v: 0
    });

    console.log('Created new user:', result.insertedId);

    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    return NextResponse.json({ token, user: { id: result.insertedId, name, email, location } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
