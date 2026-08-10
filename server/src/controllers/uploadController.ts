import { Response } from 'express';
import { AuthRequest } from '../types';
import { generatePresignedUrl } from '../services/s3Service';

/**
 * POST /api/upload/presigned
 * Generate a presigned URL for client-side direct S3 upload.
 */
export const getPresignedUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      res.status(400).json({ message: 'fileName and fileType are required' });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(fileType)) {
      res.status(400).json({ message: 'File type not allowed. Supported: JPEG, PNG, GIF, WebP, SVG' });
      return;
    }

    const { uploadUrl, fileUrl } = await generatePresignedUrl(fileName, fileType);

    res.status(200).json({
      success: true,
      uploadUrl,
      fileUrl,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate upload URL', error: error.message });
  }
};
