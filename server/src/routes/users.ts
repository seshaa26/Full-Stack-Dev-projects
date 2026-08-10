import { Router } from 'express';
import { getMe, updateProfile } from '../controllers/userController';
import auth from '../middleware/auth';

const router = Router();

// GET /api/users/me — Get authenticated user profile
router.get('/me', auth, getMe);

// PUT /api/users/profile — Update user bio, skills, avatar
router.put('/profile', auth, updateProfile);

export default router;
