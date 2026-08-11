import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
  avatar: string;
}

export interface OracleUserPayload {
  oracleId: string;
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
 * Build the Oracle IDCS authorization URL for the OAuth2 Authorization Code flow.
 * Returns the URL the client should redirect to, plus a state token for CSRF protection.
 */
export const buildOracleAuthUrl = (): { url: string; state: string } => {
  const idcsUrl = process.env.ORACLE_IDCS_URL;
  const clientId = process.env.ORACLE_CLIENT_ID;
  const redirectUri = process.env.ORACLE_REDIRECT_URI;

  if (!idcsUrl || !clientId || !redirectUri) {
    throw new Error(
      'Oracle IDCS environment variables are not configured. ' +
      'Set ORACLE_IDCS_URL, ORACLE_CLIENT_ID, and ORACLE_REDIRECT_URI.'
    );
  }

  // Generate a random state token for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: redirectUri,
    state,
  });

  const url = `${idcsUrl}/oauth2/v1/authorize?${params.toString()}`;
  return { url, state };
};

/**
 * Exchange an Oracle authorization code for user information.
 * Calls Oracle IDCS token endpoint, then userinfo endpoint.
 */
export const verifyOracleCode = async (
  code: string
): Promise<OracleUserPayload> => {
  const idcsUrl = process.env.ORACLE_IDCS_URL;
  const clientId = process.env.ORACLE_CLIENT_ID;
  const clientSecret = process.env.ORACLE_CLIENT_SECRET;
  const redirectUri = process.env.ORACLE_REDIRECT_URI;

  if (!idcsUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error('Oracle IDCS environment variables are not fully configured.');
  }

  // Step 1: Exchange code for tokens
  const tokenResponse = await axios.post(
    `${idcsUrl}/oauth2/v1/token`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  const { access_token } = tokenResponse.data as { access_token: string };

  if (!access_token) {
    throw new Error('Oracle IDCS did not return an access token');
  }

  // Step 2: Fetch user info using access token
  const userInfoResponse = await axios.get(`${idcsUrl}/oauth2/v1/userinfo`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const info = userInfoResponse.data as {
    sub: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };

  if (!info.sub) {
    throw new Error('Oracle IDCS userinfo missing subject claim');
  }

  const name =
    info.name ||
    [info.given_name, info.family_name].filter(Boolean).join(' ') ||
    info.email?.split('@')[0] ||
    'Oracle User';

  return {
    oracleId: info.sub,
    email: info.email || '',
    name,
    avatar: info.picture || '',
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

