import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "Nebyl vybrán žádný soubor." },
        { status: 400 }
      );
    }

    let uploadedCount = 0;

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "svatba-zuzana-frantisek",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(buffer);
      });

      uploadedCount++;
    }

    return NextResponse.json({
      success: true,
      count: uploadedCount,
    });
  } catch (error) {
    console.error("CLOUDINARY_UPLOAD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Nahrávání se nepovedlo.",
      },
      { status: 500 }
    );
  }
}