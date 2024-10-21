"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertPopup } from "@/components/ui/AlertPopup";
import Sidebar from "@/components/Sidebar";
import { UserIcon, MailIcon, LockIcon, MapPinIcon } from "lucide-react";

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
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);
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
          action: "updateEmail",
          newEmail,
          currentPassword: emailUpdatePassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          type: "success",
          title: "Success",
          message: "Email updated successfully",
        });
        setUser((prevUser) => ({ ...prevUser!, email: newEmail }));
        setIsEmailDialogOpen(false);
        setEmailUpdatePassword("");
      } else {
        switch (data.error) {
          case "Email already in use":
            setAlert({
              type: "error",
              title: "Error",
              message: "This email is already associated with another user.",
            });
            break;
          case "Invalid current password":
            setAlert({
              type: "error",
              title: "Error",
              message: "The current password is incorrect.",
            });
            break;
          default:
            setAlert({
              type: "error",
              title: "Error",
              message: data.error || "Failed to update email",
            });
        }
      }
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: "An unexpected error occurred",
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setAlert({
        type: "error",
        title: "Error",
        message: "New passwords do not match",
      });
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
          action: "updatePassword",
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          type: "success",
          title: "Success",
          message: "Password updated successfully",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        if (data.error === "Invalid current password") {
          setAlert({
            type: "error",
            title: "Error",
            message: "The current password is incorrect.",
          });
        } else {
          setAlert({
            type: "error",
            title: "Error",
            message: data.error || "Failed to update password",
          });
        }
      }
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: "An unexpected error occurred",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 overflow-auto p-4 sm:p-8 ml-12 sm:ml-16">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-green-400">
          User Settings
        </h1>
        <div className="max-w-md mx-auto space-y-6">
          <Card className="bg-gray-800 shadow-lg border border-green-400">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-green-400">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg">
                <UserIcon className="text-green-400 h-6 w-6" />
                <div>
                  <p className="font-medium text-gray-300">Username</p>
                  <p className="text-lg text-white">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg">
                <MailIcon className="text-green-400 h-6 w-6" />
                <div>
                  <p className="font-medium text-gray-300">Email</p>
                  <p className="text-lg text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg">
                <MapPinIcon className="text-green-400 h-6 w-6" />
                <div>
                  <p className="font-medium text-gray-300">Location</p>
                  <p className="text-lg text-white">{user?.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-green-400">
                Update Email
              </CardTitle>
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
                <Button
                  onClick={() => setIsEmailDialogOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Update Email
                </Button>
                <Dialog
                  open={isEmailDialogOpen}
                  onOpenChange={setIsEmailDialogOpen}
                >
                  <DialogContent className="bg-gray-800 text-gray-100 sm:max-w-[425px] max-w-[90vw] w-full">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-green-400">
                        Confirm Password
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Label
                        htmlFor="emailUpdatePassword"
                        className="text-sm font-medium text-gray-200"
                      >
                        Current Password
                      </Label>
                      <Input
                        id="emailUpdatePassword"
                        type="password"
                        value={emailUpdatePassword}
                        onChange={(e) => setEmailUpdatePassword(e.target.value)}
                        className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                      />
                      <Button
                        onClick={handleEmailUpdate}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Confirm Email Update
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-green-400">
                Update Password
              </CardTitle>
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
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
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
