import { Router } from 'express';
import {
  getPosts,
  createPost,
  createPoll,
  toggleReaction,
  votePoll,
} from '../controllers/postController';
import auth from '../middleware/auth';

const router = Router();

// GET /api/posts — Paginated feed (public, but auth optional for personalization)
router.get('/', getPosts);

// POST /api/posts — Create discussion or announcement (authenticated)
router.post('/', auth, createPost);

// POST /api/posts/poll — Create interactive poll (authenticated)
router.post('/poll', auth, createPoll);

// POST /api/posts/:id/react — Toggle reaction (authenticated)
router.post('/:id/react', auth, toggleReaction);

// POST /api/posts/:id/vote — Vote on poll option (authenticated)
router.post('/:id/vote', auth, votePoll);

export default router;
