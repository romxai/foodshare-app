import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import streamifier from 'streamifier';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

async function uploadToCloudinary(file: File): Promise<string> {
  try {
    if (file.size > MAX_FILE_SIZE) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const compressedBuffer = await compressImage(buffer);
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'food-listings',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        );
        
        streamifier.createReadStream(compressedBuffer).pipe(uploadStream);
      });
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'food-listings',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        );
        
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    }
  } catch (err) {
    const error = err as Error;
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("Received search params:", Object.fromEntries(searchParams));

    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const datePosted = searchParams.get("datePosted");
    const quantityParam = searchParams.get("quantity");
    const expiryDate = searchParams.get("expiryDate");
    const postedBy = searchParams.get("postedBy");

    const { db } = await connectToDatabase();

    const query: any = {
      expiration: { $gt: new Date() },
    };

    // Basic search (keep existing logic)
    if (search) {
      query.$and = [
        {
          $or: [
            { foodType: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    // Enhanced location search with partial matching
    if (location) {
      query.location = {
        $regex: location
          .split(" ")
          .map((word) => `(?=.*${word})`)
          .join(""),
        $options: "i",
      };
    }

    // Precise date posted matching with date range (start to end of day)
    if (datePosted) {
      const startDate = new Date(datePosted);
      const endDate = new Date(datePosted);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Quantity comparison with unit handling
    if (quantityParam) {
      try {
        const { value, unit } = JSON.parse(quantityParam);
        // Convert all quantities to base units (g or ml) for comparison
        let baseValue = value;
        if (unit === "Kg") baseValue *= 1000;
        if (unit === "L") baseValue *= 1000;

        query.$or = [
          // Same unit direct comparison
          {
            quantity: { $gte: value },
            quantityUnit: unit,
          },
          // Converted unit comparison
          {
            $and: [
              {
                $or: [
                  // Handle gram conversions
                  {
                    quantity: { $gte: baseValue / 1000 },
                    quantityUnit: unit === "g" ? "Kg" : "L",
                  },
                  // Handle kilogram/liter conversions
                  {
                    quantity: { $gte: baseValue * 1000 },
                    quantityUnit: unit === "Kg" ? "g" : "ml",
                  },
                ],
              },
              // Match liquid/solid type
              {
                quantityUnit: {
                  $in:
                    unit === "Kg" || unit === "g" ? ["Kg", "g"] : ["L", "ml"],
                },
              },
            ],
          },
        ];
      } catch (e) {
        console.error("Error parsing quantity parameter:", e);
      }
    }

    // Expiry date comparison (show items expiring on or after the specified date)
    if (expiryDate) {
      const searchDate = new Date(expiryDate);
      query.expiration = {
        $gte: searchDate,
        $gt: new Date(), // Keep the existing check for non-expired items
      };
    }

    // Keep existing postedBy logic
    if (postedBy) {
      const user = await db
        .collection("users")
        .findOne({ name: { $regex: postedBy, $options: "i" } });
      if (user) {
        query.postedBy = user._id.toString();
      } else {
        return NextResponse.json([]);
      }
    }

    console.log("Final query:", JSON.stringify(query, null, 2));

    // Keep existing aggregation pipeline
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
        { $sort: { createdAt: -1 } },
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
    const imageUrls: string[] = [];

    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image${i}`) as File | null;
      if (file) {
        if (file.size > MAX_FILE_SIZE * 2) {
          throw new Error(`Image ${i + 1} is too large. Maximum size is 10MB`);
        }
        
        try {
          const imageUrl = await uploadToCloudinary(file);
          imageUrls.push(imageUrl);
        } catch (err) {
          const error = err as Error;
          throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
        }
      }
    }

    const data = Object.fromEntries(formData.entries());
    const expiration = new Date(data.expiration as string);
    const quantity = parseFloat(data.quantity as string);

    if (isNaN(quantity)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const newListing = {
      ...data,
      quantity,
      expiration,
      images: imageUrls,
      postedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("foodlistings").insertOne(newListing);

    return NextResponse.json(
      {
        message: "Listing created successfully",
        id: result.insertedId.toString(),
        images: imageUrls,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating listing:", err);
    const error = err as Error;
    return NextResponse.json(
      {
        error: "Failed to create listing",
        details: error.message || "Unknown error occurred",
      },
      { status: error.message?.includes('too large') ? 413 : 500 }
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
            return NextResponse.json(
              { error: "Invalid quantity" },
              { status: 400 }
            );
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
