import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET Endpoint: Fetch messages
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
    return NextResponse.json(
      { error: "Token expired or invalid" },
      { status: 401 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    let messages;

    if (listingId) {
      messages = await db
        .collection("messages")
        .aggregate([
          { $match: { listingId: new ObjectId(listingId) } },
          {
            $lookup: {
              from: "users",
              localField: "senderId",
              foreignField: "_id",
              as: "senderDetails",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "recipientId",
              foreignField: "_id",
              as: "recipientDetails",
            },
          },
          {
            $project: {
              content: 1,
              timestamp: 1,
              senderId: 1,
              recipientId: 1,
              senderName: { $arrayElemAt: ["$senderDetails.name", 0] },
              recipientName: { $arrayElemAt: ["$recipientDetails.name", 0] },
            },
          },
        ])
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
      id: message._id ? message._id.toString() : "",
      listingId: message.listingId ? message.listingId.toString() : "",
      senderId: message.senderId ? message.senderId.toString() : "",
      recipientId: message.recipientId ? message.recipientId.toString() : "",
      timestamp: message.timestamp
        ? message.timestamp.toISOString()
        : new Date().toISOString(),
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

// POST Endpoint: Send a message
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Token expired or invalid" },
      { status: 401 }
    );
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

    // Check if this is the first message in the conversation
    const existingMessages = await db
      .collection("messages")
      .find({ listingId: new ObjectId(listingId) })
      .toArray();

    let recipientId;
    if (existingMessages.length === 0) {
      // This is the first message in the conversation, block user from replying to their own listing
      if (listing.postedBy.toString() === user.id.toString()) {
        return NextResponse.json(
          { error: "Cannot reply to your own listing" },
          { status: 400 }
        );
      }
      // Set recipient as the listing owner if it's the first message
      recipientId = listing.postedBy;
    } else {
      // If messages exist, set recipient as the other party in the conversation
      recipientId =
        existingMessages[0].senderId.toString() === user.id.toString()
          ? existingMessages[0].recipientId
          : existingMessages[0].senderId;
    }

    // Ensure recipientId is valid
    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is not set" },
        { status: 400 }
      );
    }

    const sender = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user.id) });
    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    const recipient = await db
      .collection("users")
      .findOne({ _id: new ObjectId(recipientId) });
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const newMessage = {
      listingId: new ObjectId(listingId),
      senderId: new ObjectId(user.id),
      senderName: sender.name,
      recipientId: new ObjectId(recipientId),
      recipientName: recipient.name,
      content,
      timestamp: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);

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
