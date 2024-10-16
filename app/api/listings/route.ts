import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

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
              imagePath: 1, // Add this line
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

      //console.log("Formatted listings:", formattedListings);
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
  //console.log("POST request received for listing creation");

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.log("Unauthorized: No auth header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    console.log("Unauthorized: Invalid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const formData = await req.formData();
    //console.log("Received form data keys:", Array.from(formData.keys()));

    const file = formData.get("image") as File | null;
    let imagePath = "";

    if (file) {
      //console.log("Image file received:", file.name, "Size:", file.size, "bytes");
      const buffer = await file.arrayBuffer();
      const filename = Date.now() + "-" + file.name;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      //console.log("Ensuring directory exists:", uploadDir);
      await ensureDirectoryExists(uploadDir);
      
      imagePath = `/uploads/${filename}`; // Ensure this always starts with a slash
      const filePath = path.join(uploadDir, filename);
      
      //console.log("Writing file to:", filePath);
      await fs.writeFile(filePath, Buffer.from(buffer));
      //console.log("Image saved successfully");
    } else {
      console.log("No image file received");
    }

    const data = Object.fromEntries(formData.entries());
    //console.log("Parsed form data:", data);

    const expiration = new Date(data.expiration as string);

    const newListing = {
      ...data,
      expiration,
      imagePath, // Make sure this is set correctly
      postedBy: new ObjectId(user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    //console.log("New listing object:", newListing);

    const result = await db.collection("foodlistings").insertOne(newListing);
    //console.log("Listing created with ID:", result.insertedId.toString());

    return NextResponse.json(
      {
        message: "Listing created successfully",
        id: result.insertedId.toString(),
        imagePath,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Ensure uploads directory exists
const ensureDirectoryExists = async (directory: string) => {
  try {
    await fs.mkdir(directory, { recursive: true });
    //console.log("Directory ensured:", directory);
  } catch (error) {
    console.error("Error creating directory:", error);
  }
};
