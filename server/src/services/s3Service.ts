import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/s3';

/**
 * Generate a presigned URL for direct-to-S3 file upload.
 */
export const generatePresignedUrl = async (
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const bucket = process.env.AWS_S3_BUCKET || 'devxgen-uploads';
  const region = process.env.AWS_REGION || 'ap-south-1';

  // Generate unique key with timestamp to prevent collisions
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const key = `uploads/${timestamp}-${randomId}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });

  const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
};
