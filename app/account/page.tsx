"use client";

import React from "react";
import UserActivity from "@/components/UserActivity";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please log in to view your account.</div>;
  }

  return <UserActivity user={user} />;
}
