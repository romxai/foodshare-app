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
import { Mail, Lock, User, MapPin, Phone, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertPopup } from "@/components/ui/AlertPopup";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@/lib/utils";

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

interface Alert {
  type: "success" | "error";
  title: string;
  message: string;
}

interface FieldErrors {
  [key: string]: string;
}

interface PasswordCriteria {
  length: boolean;
  number: boolean;
  special: boolean;
}

const SignupForm: React.FC = () => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    length: false,
    number: false,
    special: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          location,
          phoneNumber: countryCode + phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes("already registered")) {
          setAlert({
            type: "error",
            title: "Registration Failed",
            message: data.error,
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setAlert({
        type: "success",
        title: "Success",
        message: data.message,
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "Invalid email address",
          }));
        } else {
          setFieldErrors((prev) => {
            const { email, ...rest } = prev;
            return rest;
          });
        }
        break;
      case "phoneNumber":
        if (!value.match(/^\d{10}$/)) {
          setFieldErrors((prev) => ({
            ...prev,
            phoneNumber: "Invalid phone number",
          }));
        } else {
          setFieldErrors((prev) => {
            const { phoneNumber, ...rest } = prev;
            return rest;
          });
        }
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "phoneNumber":
        setPhoneNumber(value);
        break;
      // ... handle other fields
    }
    validateField(name, value);
  };

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const checkPasswordsMatch = (confirmPwd: string) => {
    setPasswordsMatch(password === confirmPwd);
  };

  return (
    <>
      <Card className="w-full max-w-md bg-[#F9F3F0] border-[#ADA8B3] border-2 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#065553] font-joane font-semibold tracking-wide">
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
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Dwayne Silvapinto"
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
                  <SelectTrigger className="w-[140px] sm:w-[140px] w-[100px] bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']">
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
                    name="phoneNumber"
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      "pl-10 bg-[#F9F3F0] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond'] w-full",
                      fieldErrors.phoneNumber
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#ADA8B3]"
                    )}
                  />
                </div>
              </div>
              {fieldErrors.phoneNumber && (
                <FormError message="Invalid phone number" />
              )}
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
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    "pl-10 bg-[#F9F3F0] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']",
                    fieldErrors.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#ADA8B3]"
                  )}
                />
              </div>
              {fieldErrors.email && <FormError message={fieldErrors.email} />}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                    if (confirmPassword) {
                      checkPasswordsMatch(confirmPassword);
                    }
                  }}
                  required
                  className="pl-10 pr-10 bg-[#F9F3F0] border-[#ADA8B3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1C716F] transition-colors"
                >
                  {!showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {password &&
                !(
                  passwordCriteria.length &&
                  passwordCriteria.number &&
                  passwordCriteria.special
                ) && (
                  <div className="space-y-1 mt-2">
                    <p
                      className={`text-sm ${
                        passwordCriteria.length
                          ? "text-green-600"
                          : "text-red-600"
                      } font-['Verdana Pro Cond']`}
                    >
                      • Password should be at least 8 characters
                    </p>
                    <p
                      className={`text-sm ${
                        passwordCriteria.number
                          ? "text-green-600"
                          : "text-red-600"
                      } font-['Verdana Pro Cond']`}
                    >
                      • Password should contain at least 1 numerical character
                    </p>
                    <p
                      className={`text-sm ${
                        passwordCriteria.special
                          ? "text-green-600"
                          : "text-red-600"
                      } font-['Verdana Pro Cond']`}
                    >
                      • Password should contain at least 1 special character
                    </p>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[#1C716F] font-['Verdana Pro Cond']"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    checkPasswordsMatch(e.target.value);
                  }}
                  required
                  className={cn(
                    "pl-10 pr-10 bg-[#F9F3F0] border-2 text-gray-800 focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']",
                    !passwordsMatch && confirmPassword
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#ADA8B3] focus:border-[#065553]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1C716F] transition-colors"
                >
                  {!showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!passwordsMatch && confirmPassword && (
                <p className="text-sm text-red-600 font-['Verdana Pro Cond']">
                  Passwords do not match
                </p>
              )}
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
              <div className="bg-[#F9F3F0] border-2 border-red-400 p-3 rounded-xl">
                <p className="text-xs text-red-600 font-['Verdana Pro Cond']">
                  <FormError
                    message={error}
                    includeLoginLink={error.includes("already registered")}
                  />
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
              disabled={
                loading ||
                !passwordsMatch ||
                !passwordCriteria.length ||
                !passwordCriteria.number ||
                !passwordCriteria.special
              }
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

      {alert && (
        <AlertPopup
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
};

export default SignupForm;
