import { Router } from 'express';
import { getComments, createComment } from '../controllers/commentController';
import auth from '../middleware/auth';

const router = Router();

// GET /api/posts/:id/comments — Fetch comments for a post (public)
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments — Create comment (authenticated)
router.post('/:id/comments', auth, createComment);

export default router;
