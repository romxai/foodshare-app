import { User } from '../types';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  email: string;
  // Add any other fields that are included in your JWT payload
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const response = await fetch('/api/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      location: userData.location
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function updateUserEmail(userId: string, newEmail: string): Promise<void> {
  const response = await fetch(`/api/user/${userId}/email`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ email: newEmail }),
  });

  if (!response.ok) {
    throw new Error('Failed to update email');
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const response = await fetch(`/api/user/${userId}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!response.ok) {
    throw new Error('Failed to update password');
  }
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function login(email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.token;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
}
