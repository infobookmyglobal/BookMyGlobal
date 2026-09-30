import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(media);
}

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { filename, url, s3Key, mimeType, size } = await req.json();
    if (!filename || !url || !s3Key) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        filename,
        url,
        s3Key,
        mimeType,
        size: parseInt(size),
        uploadedById: userId,
      },
    });

    return NextResponse.json(media);
  } catch (error: any) {
    console.error("Failed to save media record:", error);
    return NextResponse.json({ error: error.message || "Failed to save record" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    // Delete physical file from S3 bucket
    try {
      await deleteObject(media.s3Key);
    } catch (s3Err) {
      console.warn("Media deletion from S3 bucket failed or skipped:", s3Err);
    }

    // Delete record from Database
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Media deletion failed:", error);
    return NextResponse.json({ error: error.message || "Failed to delete media" }, { status: 500 });
  }
}
