"use client";

import React, { useEffect, useState } from 'react';
import UserActivity from '@/components/UserActivity';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <UserActivity user={user} />
    </div>
  );
};

export default AccountPage;
