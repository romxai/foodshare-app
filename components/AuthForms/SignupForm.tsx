"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Sending signup request with data:", {
        name,
        email,
        password,
        location,
      });
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, location }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-gray-800 text-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl text-green-400">Sign Up</CardTitle>
        <CardDescription className="text-gray-400">
          Create an account to start sharing and accessing food listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Username
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="romxai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-200">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Chembur, Mumbai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-green-700 text-white hover:bg-green-800"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
