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
      const messages = await db
        .collection("messages")
        .find({
          $or: [
            {
              sender: new ObjectId(user.id),
              recipient: new ObjectId(conversationId),
            },
            {
              sender: new ObjectId(conversationId),
              recipient: new ObjectId(user.id),
            },
          ],
        })
        .sort({ timestamp: 1 })
        .toArray();

      //console.log("Fetched messages:", messages); // Add this line

      return NextResponse.json(messages);
    } else {
      // Fetch all conversations
      const conversations = await db
        .collection("messages")
        .aggregate([
          {
            $match: {
              $or: [
                { sender: new ObjectId(user.id) },
                { recipient: new ObjectId(user.id) },
              ],
            },
          },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$sender", new ObjectId(user.id)] },
                  "$recipient",
                  "$sender",
                ],
              },
              lastMessage: { $last: "$$ROOT" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "otherUser",
            },
          },
          {
            $unwind: "$otherUser",
          },
          {
            $project: {
              _id: 1,
              otherUser: { _id: 1, name: 1 },
              lastMessage: { content: 1, timestamp: 1 },
            },
          },
          {
            $sort: { "lastMessage.timestamp": -1 },
          },
        ])
        .toArray();

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
    const { content, conversationId, recipientId, listingId } = await request.json();

    console.log("Received data:", { content, conversationId, recipientId, listingId });

    let conversation: any;

    if (conversationId) {
      console.log("Searching for existing conversation with ID:", conversationId);
      conversation = await db.collection("conversations").findOne({ _id: new ObjectId(conversationId) });
      
      if (!conversation) {
        console.log("Conversation not found by ID, searching by participants");
        conversation = await db.collection("conversations").findOne({
          participants: { $all: [new ObjectId(user.id), new ObjectId(conversationId)] }
        });
      }

      if (!conversation) {
        console.log("Conversation not found");
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
      console.log("Found conversation:", conversation);
    } else if (recipientId && listingId) {
      console.log("Creating new conversation");
      conversation = await db.collection("conversations").findOne({
        participants: {
          $all: [new ObjectId(user.id), new ObjectId(recipientId)],
        },
        listingId: new ObjectId(listingId),
      });

      if (!conversation) {
        const newConversation = {
          participants: [new ObjectId(user.id), new ObjectId(recipientId)],
          listingId: new ObjectId(listingId),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await db
          .collection("conversations")
          .insertOne(newConversation);
        conversation = { ...newConversation, _id: result.insertedId };
      }
    } else {
      console.log("Invalid request parameters");
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const newMessage = {
      conversationId: conversation._id,
      sender: new ObjectId(user.id),
      recipient: conversation.participants.find((p: ObjectId) => !p.equals(new ObjectId(user.id))),
      content,
      timestamp: new Date(),
      read: false,
    };

    console.log("Inserting new message:", newMessage);
    const messageResult = await db.collection("messages").insertOne(newMessage);

    console.log("Updating conversation with new message");
    await db.collection("conversations").updateOne(
      { _id: conversation._id },
      { $set: { lastMessage: { content, timestamp: new Date() }, updatedAt: new Date() } }
    );

    console.log("Message sent successfully");
    return NextResponse.json({
      conversation,
      message: { ...newMessage, _id: messageResult.insertedId }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating conversation or sending message:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: "An unexpected error occurred", details: errorMessage },
      { status: 500 }
    );
  }
}
