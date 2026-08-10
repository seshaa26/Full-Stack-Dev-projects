import { Request } from 'express';

// Extend Express Request to include authenticated user ID
export interface AuthRequest extends Request {
  userId?: string;
}

// Reaction type enum
export type ReactionType = 'like' | 'insightful' | 'fire' | 'code';

// Post type enum
export type PostType = 'discussion' | 'poll' | 'announcement';

// Poll option subdocument
export interface IPollOption {
  optionText: string;
  votes: string[]; // Array of User ObjectId strings
}

// Reaction subdocument
export interface IReaction {
  user: string; // User ObjectId string
  type: ReactionType;
}
