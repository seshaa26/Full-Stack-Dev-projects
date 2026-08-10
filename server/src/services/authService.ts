import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
  avatar: string;
}

/**
 * Verify a Google OAuth ID token and extract user information.
 */
export const verifyGoogleToken = async (
  credential: string
): Promise<GoogleUserPayload> => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token payload');
  }

  return {
    googleId: payload.sub,
    email: payload.email || '',
    name: payload.name || '',
    avatar: payload.picture || '',
  };
};

/**
 * Sign a JWT token for the authenticated user.
 */
export const signJWT = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};
