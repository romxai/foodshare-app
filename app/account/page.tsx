'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUserEmail, updateUserPassword } from "../../lib/auth";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserActivity from "@/components/UserActivity";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail !== confirmEmail) {
      setError("Email addresses do not match");
      return;
    }
    setShowEmailConfirm(true);
  };

  const confirmEmailUpdate = async () => {
    if (!user) return;
    try {
      // Here you would typically verify the password on the server
      // For this example, we'll just assume it's correct
      await updateUserEmail(user.id, newEmail);
      setUser({ ...user, email: newEmail });
      setNewEmail("");
      setConfirmEmail("");
      setEmailConfirmPassword("");
      setShowEmailConfirm(false);
    } catch (err) {
      setError("Failed to update email");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    try {
      // Here you would typically verify the current password on the server
      // For this example, we'll just assume it's correct
      await updateUserPassword(user.id, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("Password updated successfully");
    } catch (err) {
      setError("Failed to update password");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Location: {user.location}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Update Email</h2>
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New Email"
            required
          />
          <Input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Confirm New Email"
            required
          />
          <Button type="submit">Update Email</Button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Update Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            required
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            required
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            required
          />
          <Button type="submit">Update Password</Button>
        </form>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <UserActivity user={user} />

      <AlertDialog open={showEmailConfirm} onOpenChange={setShowEmailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Update</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter your password to confirm the email change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            value={emailConfirmPassword}
            onChange={(e) => setEmailConfirmPassword(e.target.value)}
            placeholder="Enter your password"
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEmailUpdate}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountPage;
