import { User } from '../types';

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
