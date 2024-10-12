import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  const type = searchParams.get("type");

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    let messages;

    if (listingId) {
      messages = await db
        .collection("messages")
        .find({ listingId: new ObjectId(listingId) })
        .sort({ timestamp: 1 })
        .toArray();
    } else if (type === "inbox") {
      messages = await db
        .collection("messages")
        .find({ recipientId: new ObjectId(user.id) })
        .sort({ timestamp: -1 })
        .toArray();
    } else if (type === "outbox") {
      messages = await db
        .collection("messages")
        .find({ senderId: new ObjectId(user.id) })
        .sort({ timestamp: -1 })
        .toArray();
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const formattedMessages = messages.map((message) => ({
      ...message,
      id: message._id.toString(),
      listingId: message.listingId.toString(),
      senderId: message.senderId.toString(),
      recipientId: message.recipientId.toString(),
      timestamp: message.timestamp.toISOString(),
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { listingId, content } = await request.json();

    const listing = await db
      .collection("foodlistings")
      .findOne({ _id: new ObjectId(listingId) });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Prevent users from messaging themselves
    if (listing.postedBy.toString() === user.id) {
      return NextResponse.json(
        { error: "You cannot message yourself" },
        { status: 400 }
      );
    }

    // Fetch the sender's full user document
    const sender = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    // Fetch the recipient's full user document
    const recipient = await db.collection("users").findOne({ _id: new ObjectId(listing.postedBy) });
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const newMessage = {
      listingId: new ObjectId(listingId),
      senderId: new ObjectId(user.id),
      senderName: sender.name,
      recipientId: new ObjectId(listing.postedBy),
      recipientName: recipient.name,
      content,
      timestamp: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);

    // Return the created message
    return NextResponse.json({ 
      message: "Message sent successfully",
      id: result.insertedId.toString(),
      senderId: newMessage.senderId.toString(),
      senderName: newMessage.senderName,
      recipientId: newMessage.recipientId.toString(),
      recipientName: newMessage.recipientName,
      content: newMessage.content,
      timestamp: newMessage.timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
