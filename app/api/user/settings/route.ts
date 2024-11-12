import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const data = await request.json();
    const { action } = data;

    // Get user from database once
    const dbUser = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "updateEmail": {
        const { newEmail, currentPassword } = data;
        
        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!passwordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Update email
        await db.collection("users").updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { email: newEmail } }
        );

        return NextResponse.json({ message: "Email updated successfully" });
      }

      case "updatePassword": {
        const { newPassword, currentPassword } = data;
        
        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!passwordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.collection("users").updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { password: hashedPassword } }
        );

        return NextResponse.json({ message: "Password updated successfully" });
      }

      case "updatePhone": {
        const { newPhoneNumber, currentPassword } = data;
        
        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!passwordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Check if phone number is already in use
        const existingUserWithPhone = await db.collection("users").findOne({
          phoneNumber: newPhoneNumber,
          _id: { $ne: new ObjectId(user.id) }
        });

        if (existingUserWithPhone) {
          return NextResponse.json(
            { error: "Phone number already exists" },
            { status: 400 }
          );
        }

        // Update phone number
        await db.collection("users").updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { phoneNumber: newPhoneNumber } }
        );

        return NextResponse.json({ message: "Phone number updated successfully" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
