"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { HomeIcon, MessageSquareIcon, SettingsIcon, LogOutIcon, MenuIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertPopup } from "@/components/ui/AlertPopup";

const UserSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailUpdatePassword, setEmailUpdatePassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [alert, setAlert] = useState<{ type: 'error' | 'success', title: string, message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        setNewEmail(currentUser.email);
      }
    };
    fetchUser();
  }, []);

  const handleEmailUpdate = async () => {
    setEmailError("");
    setEmailSuccess("");
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newEmail,
          currentPassword: emailUpdatePassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', title: 'Success', message: 'Email updated successfully' });
        setUser((prevUser) => ({ ...prevUser!, email: newEmail }));
        setIsEmailDialogOpen(false);
        setEmailUpdatePassword("");
      } else {
        switch (data.error) {
          case "Email already in use":
            setAlert({ type: 'error', title: 'Error', message: 'This email is already associated with another user.' });
            break;
          case "Invalid email format":
            setAlert({ type: 'error', title: 'Error', message: 'Please enter a valid email address.' });
            break;
          case "Invalid current password":
            setAlert({ type: 'error', title: 'Error', message: 'The current password is incorrect.' });
            break;
          default:
            setAlert({ type: 'error', title: 'Error', message: data.error || 'Failed to update email' });
        }
      }
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'An unexpected error occurred' });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', title: 'Error', message: 'New passwords do not match' });
      return;
    }

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', title: 'Success', message: 'Password updated successfully' });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        if (data.error === "Invalid current password") {
          setAlert({ type: 'error', title: 'Error', message: 'The current password is incorrect.' });
        } else {
          setAlert({ type: 'error', title: 'Error', message: data.error || 'Failed to update password' });
        }
      }
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'An unexpected error occurred' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gray-800 transition-all duration-300 ease-in-out`}
      >
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/")}>
                <HomeIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Home"}
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/messages")}>
                <MessageSquareIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Messages"}
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/settings")}>
                <SettingsIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Settings"}
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOutIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Logout"}
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-green-400">User Settings</h1>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          {/* User Information Tile */}
          <Card className="w-full mb-6 bg-gray-800 text-gray-100">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Username:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Location:</strong> {user.location}</p>
            </CardContent>
          </Card>

          {/* Update Email Tile */}
          <Card className="w-full mb-6 bg-gray-800 text-gray-100">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400">Update Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                  />
                </div>
                <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-700 text-white hover:bg-green-800">
                      Update Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-gray-100 z-50"> {/* Added z-index */}
                    <DialogHeader>
                      <DialogTitle>Confirm Password</DialogTitle>
                      <DialogDescription>
                        Please enter your current password to update your email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder="Current Password"
                        value={emailUpdatePassword}
                        onChange={(e) => setEmailUpdatePassword(e.target.value)}
                        className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                      />
                      <Button onClick={handleEmailUpdate} className="bg-green-700 text-white hover:bg-green-800">
                        Confirm Email Update
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Update Password Tile */}
          <Card className="w-full mb-6 bg-gray-800 text-gray-100">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400">Update Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                  />
                </div>
                {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}
                <Button type="submit" className="bg-green-700 text-white hover:bg-green-800">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
      {alert && (
        <AlertPopup
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default UserSettings;
