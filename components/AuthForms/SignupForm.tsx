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
import { Mail, Lock, User, MapPin, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+7", country: "Russia" },
  { code: "+39", country: "Italy" },
];

const SignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          location,
          phoneNumber: fullPhoneNumber,
        }),
      });

      const data = await response.json();

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
    <Card className="w-full max-w-md bg-[#F9F3F0] border-[#ADA8B3] border-2 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#065553] font-korolev tracking-wide">
          Sign Up
        </CardTitle>
        <CardDescription className="text-gray-600 font-['Verdana Pro Cond']">
          Create an account to start sharing and accessing food listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="name"
                type="text"
                placeholder="romxai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[140px] bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent className="bg-[#F9F3F0] border-[#ADA8B3] border-2">
                  {countryCodes.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className="font-['Verdana Pro Cond']"
                    >
                      {`${country.code} ${country.country}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="pl-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond'] w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
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
            <Label
              htmlFor="password"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-[#1C716F] font-['Verdana Pro Cond']"
            >
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="location"
                type="text"
                placeholder="Chembur, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="pl-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
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
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600 font-['Verdana Pro Cond']">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#1C716F] hover:text-[#065553] hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
