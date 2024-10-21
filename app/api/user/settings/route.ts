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
    const { action, newEmail, currentPassword, newPassword } = await request.json();
    const { db } = await connectToDatabase();

    const dbUser = await db.collection("users").findOne({ _id: new ObjectId(user.id) });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "updateEmail") {
      // Check if the new email is already in use
      const existingUser = await db.collection("users").findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
      }

      // Update email
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) },
        { $set: { email: newEmail } }
      );

      return NextResponse.json({ message: "Email updated successfully" });
    } else if (action === "updatePassword") {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) },
        { $set: { password: hashedPassword } }
      );

      return NextResponse.json({ message: "Password updated successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
