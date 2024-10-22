import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("Received search params:", Object.fromEntries(searchParams));

    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const datePosted = searchParams.get('datePosted');
    const quantity = searchParams.get('quantity');
    const expiryDate = searchParams.get('expiryDate');
    const postedBy = searchParams.get('postedBy');

    const { db } = await connectToDatabase();

    const query: any = {
      // Always filter out expired listings
      expiration: { $gt: new Date() }
    };

    // Basic search
    if (search) {
      console.log("Applying basic search for:", search);
      query.$and = [
        {
          $or: [
            { foodType: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // Advanced search filters
    if (location) {
      console.log("Filtering by location:", location);
      query.location = { $regex: location, $options: 'i' };
    }

    if (datePosted) {
      console.log("Filtering by date posted:", datePosted);
      const date = new Date(datePosted);
      query.createdAt = { $gte: date };
    }

    if (quantity) {
      console.log("Filtering by quantity:", quantity);
      const numQuantity = parseFloat(quantity);
      const lowerBound = (numQuantity * 0.9).toString();
      const upperBound = (numQuantity * 1.1).toString();
      query.quantity = { 
        $gte: lowerBound,
        $lte: upperBound
      };
    }

    if (expiryDate) {
      console.log("Filtering by expiry date:", expiryDate);
      const date = new Date(expiryDate);
      // Ensure the expiry date is after the current date but before or equal to the specified date
      query.expiration = { $gt: new Date(), $lte: date };
    }

    if (postedBy) {
      console.log("Filtering by posted by:", postedBy);
      const user = await db.collection("users").findOne({ name: { $regex: postedBy, $options: 'i' } });
      if (user) {
        query.postedBy = user._id.toString();
      } else {
        console.log("No user found for postedBy:", postedBy);
        return NextResponse.json([]);
      }
    }

    console.log("Final query:", JSON.stringify(query, null, 2));

    const listings = await db
      .collection("foodlistings")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedByUser",
          },
        },
        {
          $addFields: {
            postedByUsername: { $arrayElemAt: ["$postedByUser.name", 0] },
          },
        },
        {
          $project: {
            postedByUser: 0,
          },
        },
      ])
      .toArray();

    console.log("Fetched listings count:", listings.length);

    return NextResponse.json(listings);
  } catch (error) {
    console.error("API: Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
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
    const formData = await request.formData();

    const imagePaths: string[] = [];

    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image${i}`) as File | null;
      if (file) {
        const buffer = await file.arrayBuffer();
        const filename = Date.now() + "-" + file.name;
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        await ensureDirectoryExists(uploadDir);

        const imagePath = `/uploads/${filename}`;
        const filePath = path.join(uploadDir, filename);

        await fs.writeFile(filePath, Buffer.from(buffer));
        imagePaths.push(imagePath);
      }
    }

    const data = Object.fromEntries(formData.entries());
    const expiration = new Date(data.expiration as string);

    // Convert quantity to a number
    const quantity = parseFloat(data.quantity as string);
    if (isNaN(quantity)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const newListing = {
      ...data,
      quantity, // Store as a number
      expiration,
      imagePaths,
      postedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("New listing:", newListing);

    const result = await db.collection("foodlistings").insertOne(newListing);

    return NextResponse.json(
      {
        message: "Listing created successfully",
        id: result.insertedId.toString(),
        imagePaths,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

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
    const { db } = await connectToDatabase();
    const formData = await request.formData();
    const updateData: any = {};
    const listingId = formData.get("id") as string;

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Process form data
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith("image")) {
        // Handle image uploads
        // You may need to implement image upload logic here
      } else if (key !== "id") {
        if (key === "quantity") {
          // Convert quantity to a number
          const quantity = parseFloat(value as string);
          if (isNaN(quantity)) {
            return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
          }
          updateData[key] = quantity;
        } else {
          updateData[key] = value;
        }
      }
    }

    const result = await db
      .collection("foodlistings")
      .updateOne(
        { _id: new ObjectId(listingId), postedBy: user.id },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Listing not found or not authorized to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Listing updated successfully" });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("id");

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("foodlistings").deleteOne({
      _id: new ObjectId(listingId),
      postedBy: user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Listing not found or not authorized to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
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
