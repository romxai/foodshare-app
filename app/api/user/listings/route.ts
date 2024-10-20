import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
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
    const { db } = await connectToDatabase();
    const listings = await db
      .collection("foodlistings")
      .find({ postedBy: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
