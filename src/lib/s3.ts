import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = (process.env.AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET)!;
const CLOUDFRONT_DOMAIN = (process.env.AWS_CLOUDFRONT_DOMAIN ?? process.env.CLOUDFRONT_DOMAIN)!;

export async function uploadFile(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return getCloudFrontUrl(key);
}

export const uploadToS3 = uploadFile;


export async function getPresignedUploadUrl(
  key: string,
  mimeType: string,
  expiresIn = 300
): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn }
  );
}

export function getS3KeyFromUrl(urlOrKey: string): string {
  if (urlOrKey.startsWith("http://") || urlOrKey.startsWith("https://")) {
    try {
      const url = new URL(urlOrKey);
      // Remove leading slash if present
      return decodeURIComponent(url.pathname.substring(1));
    } catch (e) {
      console.error("Failed to parse URL, using raw string", e);
    }
  }
  return urlOrKey;
}

export async function getPresignedDownloadUrl(
  keyOrUrl: string,
  expiresIn = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const key = getS3KeyFromUrl(keyOrUrl);
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn }
  );
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getS3Object(keyOrUrl: string) {
  const key = getS3KeyFromUrl(keyOrUrl);
  return s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function getCloudFrontUrl(key: string): string {
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
}
