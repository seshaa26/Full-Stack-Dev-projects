import { Router } from 'express';
import { getPresignedUrl } from '../controllers/uploadController';
import auth from '../middleware/auth';

const router = Router();

// POST /api/upload/presigned — Get presigned S3 upload URL (authenticated)
router.post('/presigned', auth, getPresignedUrl);

export default router;
