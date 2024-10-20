import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newEmail, currentPassword, newPassword } = await request.json();
    const { db } = await connectToDatabase();

    const dbUser = await db.collection("users").findOne({ _id: new ObjectId(user.id) });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateFields: any = {};

    if (newEmail) {
      // Check if the new email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      // Check if the new email is already in use
      const existingUser = await db.collection("users").findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.password = hashedPassword;
    }

    if (Object.keys(updateFields).length > 0) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) },
        { $set: updateFields }
      );
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
