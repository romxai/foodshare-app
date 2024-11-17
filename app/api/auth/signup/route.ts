import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone number validation regex (for format like +917506007525)
const phoneRegex = /^\+\d{12}$/;

export async function POST(request: Request) {
  try {
    const { name, email, password, location, phoneNumber } =
      await request.json();

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push("Full name");
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");
    if (!location) missingFields.push("Location");
    if (!phoneNumber) missingFields.push("Phone number");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Please fill in the following fields: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Please use format: +917506007525",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if email exists
    const existingEmail = await db.collection("users").findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        {
          error: "Email already registered. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Check if phone number exists
    const existingPhone = await db.collection("users").findOne({ phoneNumber });
    if (existingPhone) {
      return NextResponse.json(
        {
          error: "Phone number already registered. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      location,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Signup successful! Redirecting to login page...",
      success: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
