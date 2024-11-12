import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
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
    const { phoneNumber, userId } = await request.json();

    // Check if phone number exists for any other user
    const existingUser = await db.collection("users").findOne({
      phoneNumber,
      _id: { $ne: new ObjectId(userId) } // Exclude current user
    });

    return NextResponse.json({
      exists: !!existingUser
    });

  } catch (error) {
    console.error("Check phone error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 