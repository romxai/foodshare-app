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
      let conversation = await db.collection("conversations").findOne({
        _id: new ObjectId(conversationId),
        participants: new ObjectId(user.id),
      });

      if (!conversation) {
        // If conversation not found, check if it's a user ID
        conversation = await db.collection("conversations").findOne({
          participants: {
            $all: [new ObjectId(user.id), new ObjectId(conversationId)],
          },
        });

        if (!conversation) {
          // If still not found, create a new conversation
          const newConversation = {
            participants: [new ObjectId(user.id), new ObjectId(conversationId)],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result = await db
            .collection("conversations")
            .insertOne(newConversation);
          conversation = { ...newConversation, _id: result.insertedId };
        }
      }

      const messages = await db
        .collection("messages")
        .find({ conversationId: conversation._id })
        .sort({ timestamp: 1 })
        .toArray();

      return NextResponse.json({ conversation, messages });
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
    const { content, conversationId, recipientId, listingId } =
      await request.json();

    let conversation;

    if (conversationId) {
      // Existing conversation
      conversation = await db.collection("conversations").findOne({
        _id: new ObjectId(conversationId),
        participants: new ObjectId(user.id),
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else if (recipientId) {
      // Check for existing conversation between these users
      conversation = await db.collection("conversations").findOne({
        participants: {
          $all: [new ObjectId(user.id), new ObjectId(recipientId)],
        },
      });

      if (!conversation) {
        // Create a new conversation only if one doesn't exist
        const newConversation = {
          participants: [new ObjectId(user.id), new ObjectId(recipientId)],
          listingId: listingId ? new ObjectId(listingId) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await db
          .collection("conversations")
          .insertOne(newConversation);
        conversation = { ...newConversation, _id: result.insertedId };
      }
    } else {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const newMessage = {
      conversationId: conversation._id,
      sender: new ObjectId(user.id),
      recipient: conversation.participants.find(
        (p: ObjectId) => !p.equals(new ObjectId(user.id))
      ),
      content,
      timestamp: new Date(),
      read: false,
    };

    const messageResult = await db.collection("messages").insertOne(newMessage);

    await db
      .collection("conversations")
      .updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessage: { content, timestamp: new Date() },
            updatedAt: new Date(),
          },
        }
      );

    return NextResponse.json(
      {
        conversation,
        message: { ...newMessage, _id: messageResult.insertedId },
      },
      { status: 201 }
    );
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
