import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';

/**
 * GET /api/users/me
 * Get authenticated user's profile.
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/users/profile
 * Update user bio, skills, and avatar.
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bio, skills, avatar } = req.body;
    const updateData: any = {};

    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
