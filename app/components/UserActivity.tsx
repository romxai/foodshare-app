"use client";

import React, { useState, useEffect } from "react";
import { User, Activity } from "../types";

interface UserActivityProps {
  user: User;
}

const UserActivity: React.FC<UserActivityProps> = ({ user }) => {
  const [userInfo, setUserInfo] = useState(user);
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch user activities
    const fetchActivities = async () => {
      // In a real app, this would be an API call
      const response = await fetch(`/api/user/${user.id}/activities`);
      const data = await response.json();
      setActivities(data);
    };

    fetchActivities();
  }, [user.id]);

  const handleInfoUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const updateData: any = {};

    if (newEmail && newEmail === confirmEmail) {
      updateData.email = newEmail;
    }

    if (newPassword && newPassword === confirmPassword) {
      updateData.password = newPassword;
    }

    if (Object.keys(updateData).length === 0) {
      setError("No changes to update");
      return;
    }

    try {
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        if (updateData.email) {
          setUserInfo(prev => ({ ...prev, email: updateData.email }));
        }
        setNewEmail("");
        setConfirmEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user information');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleNotificationChange = (setting: "email" | "push") => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">My Account</h2>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
        <form onSubmit={handleInfoUpdate}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2">
              Username (not changeable)
            </label>
            <input
              type="text"
              id="username"
              value={userInfo.name}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="currentEmail" className="block mb-2">
              Current Email
            </label>
            <input
              type="email"
              id="currentEmail"
              value={userInfo.email}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newEmail" className="block mb-2">
              New Email
            </label>
            <input
              type="email"
              id="newEmail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmEmail" className="block mb-2">
              Confirm New Email
            </label>
            <input
              type="email"
              id="confirmEmail"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Update Profile
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Notification Settings</h3>
        <div>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={notificationSettings.email}
              onChange={() => handleNotificationChange("email")}
              className="mr-2"
            />
            Receive email notifications
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.push}
              onChange={() => handleNotificationChange("push")}
              className="mr-2"
            />
            Receive push notifications
          </label>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Activity History</h3>
        <ul>
          {activities.map((activity) => (
            <li key={activity.id} className="mb-2">
              {activity.type}: {activity.description} -{" "}
              {new Date(activity.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default UserActivity;
