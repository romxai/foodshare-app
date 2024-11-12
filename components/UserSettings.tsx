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
import Navbar from "@/components/Navbar";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Footer from "@/components/Footer";
import { useAuthGuard } from "@/utils/authGuard";

// Define the form schema and type
const profileFormSchema = z.object({
  username: z.string().min(2),
  phoneNumber: z.string(),
  email: z.string().email(),
  location: z.string().min(2),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserSettings: React.FC = () => {
  useAuthGuard();

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
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [phoneUpdatePassword, setPhoneUpdatePassword] = useState("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      phoneNumber: "",
      email: "",
      location: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First get the current user
        const currentUser = await getCurrentUser();

        // Then fetch full user details including phone number
        if (currentUser) {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userIds: [currentUser.id] }),
          });

          if (response.ok) {
            const userData = await response.json();
            const fullUserData = userData[0];
            setUser(fullUserData);
            setNewEmail(fullUserData.email);
            setNewPhoneNumber(fullUserData.phoneNumber);

            // Update form with complete user data
            form.reset({
              username: fullUserData.name,
              phoneNumber: fullUserData.phoneNumber,
              email: fullUserData.email,
              location: fullUserData.location,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, [form]);

  const handleEmailUpdate = async () => {
    // Close dialog immediately when button is clicked
    setIsEmailDialogOpen(false);

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
        setEmailUpdatePassword(""); // Clear the password field
        setUser((prevUser) => ({ ...prevUser!, email: newEmail }));
        setAlert({
          type: "success",
          title: "Success",
          message: "Email updated successfully",
        });
      } else {
        setAlert({
          type: "error",
          title: "Error",
          message: data.error || "Failed to update email",
        });
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
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setAlert({
          type: "success",
          title: "Success",
          message: "Password updated successfully",
        });
      } else {
        setAlert({
          type: "error",
          title: "Error",
          message: data.error || "Failed to update password",
        });
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

  const handlePhoneUpdate = async () => {
    setIsPhoneDialogOpen(false);

    try {
      // First check if phone number already exists
      const checkResponse = await fetch("/api/users/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          phoneNumber: newPhoneNumber,
          userId: user?.id, // Exclude current user from check
        }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setAlert({
          type: "error",
          title: "Error",
          message:
            "This phone number is already associated with another account",
        });
        return;
      }

      // If phone number is available, proceed with update
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          action: "updatePhone",
          newPhoneNumber,
          currentPassword: phoneUpdatePassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPhoneUpdatePassword(""); // Clear the password field
        setUser((prevUser) => ({ ...prevUser!, phoneNumber: newPhoneNumber }));
        setAlert({
          type: "success",
          title: "Success",
          message: "Phone number updated successfully",
        });
      } else {
        // Handle other errors
        let errorMessage = "Failed to update phone number";

        switch (data.error) {
          case "Invalid password":
            errorMessage = "Invalid password";
            break;
          default:
            errorMessage = data.error || "Failed to update phone number";
        }

        setAlert({
          type: "error",
          title: "Error",
          message: errorMessage,
        });
      }
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: "An unexpected error occurred",
      });
    } finally {
      setPhoneUpdatePassword(""); // Clear password field regardless of outcome
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#ECFDED]">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 pt-16">
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#ECFDED]">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-[#F9F3F0] shadow-lg border-[#ADA8B3] border-2">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-[#065553] font-korolev tracking-wide">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1C716F] font-['Verdana Pro Cond']">
                            Username
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <UserIcon className="text-[#1C716F] h-5 w-5 flex-shrink-0" />
                              <Input
                                {...field}
                                disabled
                                value={user?.name}
                                className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-500 font-['Verdana Pro Cond']">
                            This is your public display name.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1C716F] font-['Verdana Pro Cond']">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <PhoneIcon className="text-[#1C716F] h-5 w-5 flex-shrink-0" />
                              <Input
                                {...field}
                                disabled
                                value={user?.phoneNumber}
                                className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-500 font-['Verdana Pro Cond']">
                            Your contact number for listings.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1C716F] font-['Verdana Pro Cond']">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <MailIcon className="text-[#1C716F] h-5 w-5 flex-shrink-0" />
                              <Input
                                {...field}
                                disabled
                                value={user?.email}
                                className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-500 font-['Verdana Pro Cond']">
                            Your registered email address.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1C716F] font-['Verdana Pro Cond']">
                            Location
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <MapPinIcon className="text-[#1C716F] h-5 w-5 flex-shrink-0" />
                              <Input
                                {...field}
                                disabled
                                value={user?.location}
                                className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-500 font-['Verdana Pro Cond']">
                            Your primary location for food listings.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="bg-[#F9F3F0] shadow-lg border-[#ADA8B3] border-2">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-[#065553] font-korolev tracking-wide">
                  Update Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="newEmail"
                      className="text-[#1C716F] font-['Verdana Pro Cond']"
                    >
                      New Email
                    </Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                    />
                  </div>
                  <Button
                    onClick={() => setIsEmailDialogOpen(true)}
                    className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
                  >
                    Update Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#F9F3F0] shadow-lg border-[#ADA8B3] border-2">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-[#065553] font-korolev tracking-wide">
                  Update Phone Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPhoneNumber"
                      className="text-[#1C716F] font-['Verdana Pro Cond']"
                    >
                      New Phone Number
                    </Label>
                    <Input
                      id="newPhoneNumber"
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                    />
                  </div>
                  <Button
                    onClick={() => setIsPhoneDialogOpen(true)}
                    className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
                  >
                    Update Phone Number
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#F9F3F0] shadow-lg border-[#ADA8B3] border-2">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-[#065553] font-korolev tracking-wide">
                  Update Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-[#1C716F] font-['Verdana Pro Cond']"
                    >
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-[#1C716F] font-['Verdana Pro Cond']"
                    >
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-[#1C716F] font-['Verdana Pro Cond']"
                    >
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
                  >
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="bg-[#F9F3F0] sm:max-w-[425px] max-w-[90vw] w-full border-[#ADA8B3] border-2">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#065553] font-korolev tracking-wide">
              Confirm Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Label
              htmlFor="emailUpdatePassword"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
              Current Password
            </Label>
            <Input
              id="emailUpdatePassword"
              type="password"
              value={emailUpdatePassword}
              onChange={(e) => setEmailUpdatePassword(e.target.value)}
              className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
            />
            <Button
              onClick={handleEmailUpdate}
              className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
            >
              Confirm Email Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent className="bg-[#F9F3F0] sm:max-w-[425px] max-w-[90vw] w-full border-[#ADA8B3] border-2">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#065553] font-korolev tracking-wide">
              Confirm Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Label
              htmlFor="phoneUpdatePassword"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
              Current Password
            </Label>
            <Input
              id="phoneUpdatePassword"
              type="password"
              value={phoneUpdatePassword}
              onChange={(e) => setPhoneUpdatePassword(e.target.value)}
              className="bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
            />
            <Button
              onClick={handlePhoneUpdate}
              className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
            >
              Confirm Phone Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {alert && (
        <AlertPopup
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <Footer />
    </div>
  );
};

export default UserSettings;
