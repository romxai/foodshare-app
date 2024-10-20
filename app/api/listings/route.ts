import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const datePosted = searchParams.get("datePosted") || "";
  const quantity = searchParams.get("quantity") || "";
  const expiryDate = searchParams.get("expiryDate") || "";
  const postedBy = searchParams.get("postedBy") || "";
  const showExpired = searchParams.get("showExpired") === "true";

  try {
    const { db } = await connectToDatabase();

    const query: any = {
      expiration: { $gt: new Date() }, // By default, only show non-expired listings
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
      const startOfDay = new Date(datePosted);
      const endOfDay = new Date(datePosted);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }

    if (quantity) {
      query.quantity = quantity; // Compare as string
    }

    if (expiryDate) {
      const startOfDay = new Date(expiryDate);
      const endOfDay = new Date(expiryDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.expiration = { $gte: startOfDay, $lt: endOfDay };
    }

    if (postedBy) {
      const user = await db
        .collection("users")
        .findOne({ name: { $regex: postedBy, $options: "i" } });
      if (user) {
        query.postedBy = user._id.toString();
      } else {
        // If no user found, return empty result
        return NextResponse.json([]);
      }
    }

    // If showExpired is true, remove the expiration filter
    if (showExpired) {
      delete query.expiration;
    }

    console.log("Query:", query);

    const listings = await db
      .collection("foodlistings")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            let: { postedById: { $toObjectId: "$postedBy" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$postedById"] } } },
            ],
            as: "userDetails",
          },
        },
        {
          $project: {
            foodType: 1,
            description: 1,
            quantity: 1,
            quantityUnit: 1,
            expiration: 1,
            location: 1,
            createdAt: 1,
            updatedAt: 1,
            imagePaths: 1,
            postedBy: { $arrayElemAt: ["$userDetails.name", 0] },
            postedById: "$postedBy",
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

    console.log("Formatted listings:", formattedListings);
    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  //console.log("POST request received for listing creation");

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

    let imagePaths: string[] = [];

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

    const newListing = {
      ...data,
      expiration,
      imagePaths,
      postedBy: user.id, // This is correct, we're storing the user ID as a string
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
    const listingId = formData.get('id') as string;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    // Process form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image')) {
        // Handle image uploads
        // You may need to implement image upload logic here
      } else if (key !== 'id') {
        updateData[key] = value;
      }
    }

    const result = await db.collection("foodlistings").updateOne(
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
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
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
