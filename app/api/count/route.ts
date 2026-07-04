import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("resource_type:image OR resource_type:video")
      .max_results(1)
      .execute();

    return NextResponse.json({
      count: result.total_count ?? 0,
    });
  } catch (error) {
    console.error("COUNT_ERROR:", error);

    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}