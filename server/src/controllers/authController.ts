import { Request, Response } from 'express';
import User from '../models/User';
import {
  verifyGoogleToken,
  verifyOracleCode,
  buildOracleAuthUrl,
  signJWT,
} from '../services/authService';

/**
 * POST /api/auth/google
 * Exchange Google OAuth credential for JWT.
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ message: 'Google credential is required' });
      return;
    }

    // Verify the Google token
    const googleUser = await verifyGoogleToken(credential);

    // Upsert user — create if new, update if existing
    let user = await User.findOne({ googleId: googleUser.googleId });

    if (!user) {
      // Check if an Oracle user with the same email already exists → link accounts
      user = await User.findOne({ email: googleUser.email.toLowerCase() });
      if (user) {
        user.googleId = googleUser.googleId;
        user.authProvider = 'both';
        user.name = googleUser.name;
        user.avatar = googleUser.avatar;
        await user.save();
        console.log(`🔗 Linked Google account to existing Oracle user: ${user.email}`);
      } else {
        user = await User.create({
          googleId: googleUser.googleId,
          authProvider: 'google',
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.avatar,
          bio: '',
          skills: [],
        });
        console.log(`✅ New user registered via Google: ${user.email}`);
      }
    } else {
      // Update avatar and name from Google on each login
      user.name = googleUser.name;
      user.avatar = googleUser.avatar;
      await user.save();
    }

    // Sign JWT
    const token = signJWT(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * GET /api/auth/oracle/url
 * Returns the Oracle IDCS authorization URL for the client to redirect to.
 */
export const getOracleAuthUrl = (_req: Request, res: Response): void => {
  try {
    const { url, state } = buildOracleAuthUrl();
    res.status(200).json({ success: true, url, state });
  } catch (error: any) {
    console.error('Oracle URL generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate Oracle auth URL', error: error.message });
  }
};

/**
 * POST /api/auth/oracle/callback
 * Exchange Oracle authorization code for JWT.
 * Body: { code: string, state: string }
 */
export const oracleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: 'Oracle authorization code is required' });
      return;
    }

    // Verify code and get Oracle user info
    const oracleUser = await verifyOracleCode(code);

    // Upsert user by oracleId
    let user = await User.findOne({ oracleId: oracleUser.oracleId });

    if (!user) {
      // Check if a Google user with the same email already exists → link accounts
      user = await User.findOne({ email: oracleUser.email.toLowerCase() });
      if (user) {
        user.oracleId = oracleUser.oracleId;
        user.authProvider = 'both';
        // Only update avatar if Oracle provides one and current is empty
        if (oracleUser.avatar && !user.avatar) {
          user.avatar = oracleUser.avatar;
        }
        await user.save();
        console.log(`🔗 Linked Oracle account to existing Google user: ${user.email}`);
      } else {
        user = await User.create({
          oracleId: oracleUser.oracleId,
          authProvider: 'oracle',
          name: oracleUser.name,
          email: oracleUser.email,
          avatar: oracleUser.avatar,
          bio: '',
          skills: [],
        });
        console.log(`✅ New user registered via Oracle: ${user.email}`);
      }
    } else {
      // Refresh name/avatar from Oracle on each login
      user.name = oracleUser.name;
      if (oracleUser.avatar) user.avatar = oracleUser.avatar;
      await user.save();
    }

    // Sign JWT
    const token = signJWT(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Oracle auth error:', error.message);
    res.status(401).json({ message: 'Oracle authentication failed', error: error.message });
  }
};

