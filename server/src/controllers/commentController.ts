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

    const [topLevelComments, total] = await Promise.all([
      Comment.find({ post: id, parentComment: null })
        .populate('author', 'name email avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ post: id, parentComment: null }),
    ]);

    const topLevelIds = topLevelComments.map(c => c._id);
    const replies = await Comment.find({ post: id, parentComment: { $in: topLevelIds } })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 })
      .lean();

    const comments = topLevelComments.map(c => ({
      ...c,
      replies: replies.filter(r => r.parentComment?.toString() === c._id.toString())
    }));

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
    const { content, parentComment } = req.body;

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
      parentComment: parentComment || null,
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

/**
 * PUT /api/posts/:postId/comments/:commentId
 * Update a comment
 */
export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.author.toString() !== req.userId) {
      res.status(403).json({ message: 'Unauthorized to update this comment' });
      return;
    }

    if (content) {
      comment.content = content;
      await comment.save();
    }

    const populatedComment = await Comment.findById(commentId).populate('author', 'name email avatar').lean();

    const io = getIO();
    io.to('feed').emit('comment-updated', { postId: comment.post, comment: populatedComment });

    res.status(200).json({ success: true, comment: populatedComment });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/posts/:postId/comments/:commentId
 * Delete a comment
 */
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.author.toString() !== req.userId) {
      res.status(403).json({ message: 'Unauthorized to delete this comment' });
      return;
    }

    await comment.deleteOne();

    // Delete associated replies
    const repliesResult = await Comment.deleteMany({ parentComment: commentId });
    const totalDeleted = 1 + repliesResult.deletedCount;

    // Decrement comment count on post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -totalDeleted } });

    const io = getIO();
    io.to('feed').emit('comment-deleted', { postId, commentId });

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
