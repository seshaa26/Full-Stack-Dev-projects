// ═══════════════════════════════════════════
// DevXGen — Shared TypeScript Interfaces
// ═══════════════════════════════════════════

export interface User {
  _id: string;
  googleId?: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  createdAt: string;
}

export type ReactionType = 'like' | 'insightful' | 'fire' | 'code';

export type PostType = 'discussion' | 'poll' | 'announcement';

export interface Reaction {
  user: string | User;
  type: ReactionType;
}

export interface PollOption {
  _id: string;
  optionText: string;
  votes: string[];
}

export interface Post {
  _id: string;
  author: User;
  type: 'discussion' | 'poll' | 'announcement' | 'article' | 'event';
  title?: string;
  content: string;
  mediaUrl?: string;
  tags: string[];
  pollOptions: PollOption[];
  reactions: Reaction[];
  bookmarks: string[];
  eventDate?: string;
  eventLink?: string;
  attendees?: string[];
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  parentComment?: string;
  replies?: Comment[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  pagination: Pagination;
}

export interface CommentsResponse {
  success: boolean;
  comments: Comment[];
  pagination: Pagination;
}

export interface Notification {
  type: 'comment' | 'reaction' | 'poll';
  postId: string;
  comment?: Comment;
  timestamp?: string;
}
