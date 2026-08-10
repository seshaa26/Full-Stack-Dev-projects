import { Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthRequest } from '../types';
import { getIO } from '../config/socket';

/**
 * GET /api/posts/:id/comments
 * Fetch comments for a post, paginated.
 */
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: id })
        .populate('author', 'name email avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ post: id }),
    ]);

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/posts/:id/comments
 * Create a comment on a post.
 */
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    // Verify post exists
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = await Comment.create({
      post: id,
      author: req.userId,
      content,
    });

    // Increment comment count on post
    await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar')
      .lean();

    // Emit real-time comment event
    const io = getIO();
    io.to('feed').emit('new-comment', { postId: id, comment: populatedComment });

    // Notify post author
    if (post.author.toString() !== req.userId) {
      io.to(`user:${post.author.toString()}`).emit('notification', {
        type: 'comment',
        postId: id,
        comment: populatedComment,
      });
    }

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
