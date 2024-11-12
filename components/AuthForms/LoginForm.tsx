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
import { Mail, Lock } from "lucide-react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Sending login request...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      router.push("/listings");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-[#F9F3F0] border-[#ADA8B3] border-2 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#065553] font-korolev tracking-wide">
          Login
        </CardTitle>
        <CardDescription className="text-gray-600 font-['Verdana Pro Cond']">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1C716F] font-['Verdana Pro Cond']">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#1C716F] font-['Verdana Pro Cond']">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']"
              />
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm font-['Verdana Pro Cond']">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-6 text-center text-gray-600 font-['Verdana Pro Cond']">
          Don&apos;t have an account?{" "}
          <Link 
            href="/signup" 
            className="text-[#1C716F] hover:text-[#065553] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
