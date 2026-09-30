import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getPresignedUploadUrl, getPresignedDownloadUrl, getCloudFrontUrl } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

const presignSchema = z.object({
  key: z.string().min(1).refine((k) => k.startsWith('uploads/'), {
    message: 'Key must start with uploads/',
  }),
  mimeType: z.string().refine(
    (m) =>
      m.startsWith('image/') ||
      m === 'application/pdf' ||
      m === 'application/msword' ||
      m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    {
      message: 'Only image/*, PDF, and Word documents are allowed',
    }
  ),
  applicationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  const body = await req.json();
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { key, mimeType, applicationId } = parsed.data;

  if (key.includes('..') || (applicationId && !key.includes(`/${applicationId}/`))) {
    return NextResponse.json({ error: 'Invalid upload key' }, { status: 400 });
  }

  // Authorize upload
  let authorized = false;

  if (applicationId) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (app) {
      if (userId) {
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (user) {
          if (user.role === 'ADMIN') {
            authorized = true;
          } else if (app.userId === user.id && (app.status === 'PENDING' || app.status === 'UNDER_REVIEW')) {
            authorized = true;
          }
        }
      }
      // Anonymous uploads are never allowed.
    }
  } else {
    // If no applicationId is passed, check if the logged in user is an ADMIN (for media library uploads)
    if (userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (user && user.role === 'ADMIN') {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uploadUrl = await getPresignedUploadUrl(key, mimeType, 300);
  const cloudFrontUrl = getCloudFrontUrl(key);

  return NextResponse.json({ uploadUrl, key, cloudFrontUrl });
}
