import { Router } from 'express';
import { googleAuth } from '../controllers/authController';

const router = Router();

// POST /api/auth/google — Exchange Google OAuth credential for JWT
router.post('/google', googleAuth);

export default router;
