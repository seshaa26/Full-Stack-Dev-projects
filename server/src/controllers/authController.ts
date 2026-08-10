import { Request, Response } from 'express';
import User from '../models/User';
import { verifyGoogleToken, signJWT } from '../services/authService';

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
      user = await User.create({
        googleId: googleUser.googleId,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.avatar,
        bio: '',
        skills: [],
      });
      console.log(`✅ New user registered: ${user.email}`);
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
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};
