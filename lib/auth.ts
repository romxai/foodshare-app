import { User } from "../types";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  // Add any other fields that are included in your JWT payload
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const response = await fetch("/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token is expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function updateUserEmail(
  userId: string,
  newEmail: string
): Promise<void> {
  const response = await fetch(`/api/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ action: "updateEmail", data: { email: newEmail } }),
  });

  if (!response.ok) {
    throw new Error("Failed to update email");
  }
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`/api/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      action: "updatePassword",
      data: { password: newPassword },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update password");
  }
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error);
    } else {
      console.error("Error verifying token:", error);
    }
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}
