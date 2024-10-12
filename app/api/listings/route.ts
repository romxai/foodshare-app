import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("id");

  if (listingId) {
    // Fetch a single listing
    try {
      const { db } = await connectToDatabase();
      const listing = await db
        .collection("foodlistings")
        .findOne({ _id: new ObjectId(listingId) });

      if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      const formattedListing = {
        ...listing,
        _id: listing._id.toString(),
        postedBy: listing.postedBy.toString(),
        expiration: listing.expiration.toISOString(),
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };

      return NextResponse.json(formattedListing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  } else {
    // Fetch all listings (existing code)
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const datePosted = searchParams.get("datePosted") || "";
    const quantity = searchParams.get("quantity") || "";
    const expiryDate = searchParams.get("expiryDate") || "";
    const postedBy = searchParams.get("postedBy") || "";

    try {
      const { db } = await connectToDatabase();

      const query: any = {
        expiration: { $gt: new Date() } // Only show non-expired listings
      };

      if (search) {
        query.$or = [
          { foodType: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      if (datePosted) {
        query.createdAt = { $gte: new Date(datePosted) };
      }

      if (quantity) {
        query.quantity = { $regex: quantity, $options: "i" };
      }

      if (expiryDate) {
        query.expiration = { $lte: new Date(expiryDate), $gt: new Date() };
      }

      if (postedBy) {
        query.postedBy = new ObjectId(postedBy);
      }

      const listings = await db
        .collection("foodlistings")
        .aggregate([
          { $match: query },
          {
            $lookup: {
              from: "users",
              localField: "postedBy",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $project: {
              foodType: 1,
              description: 1,
              quantity: 1,
              expiration: 1,
              location: 1,
              createdAt: 1,
              updatedAt: 1,
              postedBy: { $arrayElemAt: ["$userDetails.name", 0] },
            },
          },
        ])
        .toArray();

      const formattedListings = listings.map((listing) => ({
        ...listing,
        _id: listing._id.toString(),
        expiration: listing.expiration.toISOString(),
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      }));

      return NextResponse.json(formattedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
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
    const data = await req.json();

    // The expiration field should already be an ISO string
    const expiration = new Date(data.expiration);

    const newListing = {
      ...data,
      expiration, // Use the Date object
      postedBy: new ObjectId(user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("foodlistings").insertOne(newListing);

    return NextResponse.json(
      {
        message: "Listing created successfully",
        id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
