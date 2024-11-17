import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const listing = await db.collection("foodlistings").findOne({
      _id: new ObjectId(params.id),
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const formData = await request.formData();

    // Get existing images that weren't removed
    const existingImages = JSON.parse(formData.get("existingImages") as string);

    // Add type for newImageUrls
    const newImageUrls: string[] = [];

    // Fix the FormData.entries() iteration
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith("image") && key !== "existingImages") {
        // Add your image upload logic here
        // const imageUrl = await uploadImage(value as File);
        // newImageUrls.push(imageUrl);
      }
    }

    // Now combine the URLs
    const allImageUrls = [...existingImages, ...newImageUrls];

    // Update the listing
    const updateData = {
      foodType: formData.get("foodType"),
      description: formData.get("description"),
      quantity: parseFloat(formData.get("quantity") as string),
      quantityUnit: formData.get("quantityUnit"),
      expiration: new Date(formData.get("expiration") as string),
      location: formData.get("location"),
      imagePaths: allImageUrls,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("foodlistings")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Listing updated successfully",
      listing: updateData,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
