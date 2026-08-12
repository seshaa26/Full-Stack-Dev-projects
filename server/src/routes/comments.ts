import { Router } from 'express';
import { getComments, createComment, updateComment, deleteComment } from '../controllers/commentController';
import auth from '../middleware/auth';

const router = Router();

// GET /api/posts/:id/comments — Fetch comments for a post (public)
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments — Create comment (authenticated)
router.post('/:id/comments', auth, createComment);

// PUT /api/posts/:postId/comments/:commentId — Update comment (authenticated)
router.put('/:postId/comments/:commentId', auth, updateComment);

// DELETE /api/posts/:postId/comments/:commentId — Delete comment (authenticated)
router.delete('/:postId/comments/:commentId', auth, deleteComment);

export default router;
