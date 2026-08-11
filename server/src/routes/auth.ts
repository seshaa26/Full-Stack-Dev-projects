import { Router } from 'express';
import { googleAuth, getOracleAuthUrl, oracleAuthCallback } from '../controllers/authController';

const router = Router();

// POST /api/auth/google — Exchange Google OAuth credential for JWT
router.post('/google', googleAuth);

// GET /api/auth/oracle/url — Get Oracle IDCS authorization URL
router.get('/oracle/url', getOracleAuthUrl);

// POST /api/auth/oracle/callback — Exchange Oracle auth code for JWT
router.post('/oracle/callback', oracleAuthCallback);

export default router;

