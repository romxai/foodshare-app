import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  try {
    const { db } = await connectToDatabase();

    if (conversationId) {
      // Fetch messages for a specific conversation
      const messages = await db.collection("messages").find({
        $or: [
          { sender: new ObjectId(user.id), recipient: new ObjectId(conversationId) },
          { sender: new ObjectId(conversationId), recipient: new ObjectId(user.id) }
        ]
      }).sort({ timestamp: 1 }).toArray();

      console.log("Fetched messages:", messages); // Add this line

      return NextResponse.json(messages);
    } else {
      // Fetch all conversations
      const conversations = await db.collection("messages").aggregate([
        {
          $match: {
            $or: [
              { sender: new ObjectId(user.id) },
              { recipient: new ObjectId(user.id) }
            ]
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$sender", new ObjectId(user.id)] },
                "$recipient",
                "$sender"
              ]
            },
            lastMessage: { $last: "$$ROOT" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "otherUser"
          }
        },
        {
          $unwind: "$otherUser"
        },
        {
          $project: {
            _id: 1,
            otherUser: { _id: 1, name: 1 },
            lastMessage: { content: 1, timestamp: 1 }
          }
        },
        {
          $sort: { "lastMessage.timestamp": -1 }
        }
      ]).toArray();

      console.log("Fetched conversations:", conversations); // Add this line

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error("Error fetching chat data:", error);
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { content, recipientId } = await request.json();

    const newMessage = {
      sender: new ObjectId(user.id),
      recipient: new ObjectId(recipientId),
      content,
      timestamp: new Date(),
      read: false
    };

    const result = await db.collection("messages").insertOne(newMessage);

    console.log("Inserted new message:", result.insertedId); // Add this line

    return NextResponse.json({
      ...newMessage,
      _id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
