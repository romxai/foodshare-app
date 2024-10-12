'use client';

import React, { useEffect, useState } from 'react';
import UserActivity from '../components/UserActivity';
import { getCurrentUser } from "../lib/auth";
import { User } from '../types';

function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <UserActivity user={user} />
    </div>
  );
}

export default AccountPage;
