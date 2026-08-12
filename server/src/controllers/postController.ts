import { Response } from 'express';
import Post from '../models/Post';
import { AuthRequest } from '../types';
import { getIO } from '../config/socket';

/**
 * GET /api/posts
 * Paginated feed with optional tag and type filters.
 */
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tag = req.query.tag as string;
    const type = req.query.type as string;

    const filter: any = {};
    if (tag) filter.tags = tag;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name email avatar')
        .populate('reactions.user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      posts,
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
 * POST /api/posts
 * Create a discussion or announcement post.
 */
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, type, mediaUrl, tags } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Post content is required' });
      return;
    }

    const postType = type === 'announcement' ? 'announcement' : 'discussion';

    const post = await Post.create({
      author: req.userId,
      type: postType,
      content,
      mediaUrl: mediaUrl || '',
      tags: tags || [],
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .lean();

    // Emit real-time event to feed
    const io = getIO();
    io.to('feed').emit('new-post', populatedPost);

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/posts/poll
 * Create an interactive poll post.
 */
export const createPoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, options, tags } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Poll question is required' });
      return;
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      res.status(400).json({ message: 'At least 2 poll options are required' });
      return;
    }

    const pollOptions = options.map((opt: string) => ({
      optionText: opt,
      votes: [],
    }));

    const post = await Post.create({
      author: req.userId,
      type: 'poll',
      content,
      tags: tags || [],
      pollOptions,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .lean();

    const io = getIO();
    io.to('feed').emit('new-post', populatedPost);

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/posts/:id/react
 * Toggle a reaction on a post.
 */
export const toggleReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' | 'insightful' | 'fire' | 'code'
    const userId = req.userId;

    const validTypes = ['like', 'insightful', 'fire', 'code'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: 'Invalid reaction type' });
      return;
    }

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if user already has this reaction type
    const existingIndex = post.reactions.findIndex(
      (r) => r.user.toString() === userId && r.type === type
    );

    if (existingIndex !== -1) {
      // Remove reaction (toggle off)
      post.reactions.splice(existingIndex, 1);
    } else {
      // Remove any other reaction by this user first, then add new one
      const otherIndex = post.reactions.findIndex(
        (r) => r.user.toString() === userId
      );
      if (otherIndex !== -1) {
        post.reactions.splice(otherIndex, 1);
      }
      post.reactions.push({ user: userId as any, type });
    }

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email avatar')
      .populate('reactions.user', 'name avatar')
      .lean();

    // Emit real-time reaction update
    const io = getIO();
    io.to('feed').emit('post-updated', updatedPost);

    res.status(200).json({ success: true, post: updatedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/posts/:id/vote
 * Vote on a poll option (single vote enforcement).
 */
export const votePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { optionId } = req.body;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.type !== 'poll') {
      res.status(400).json({ message: 'This post is not a poll' });
      return;
    }

    // Remove any existing vote by this user
    for (const option of post.pollOptions) {
      const voteIndex = option.votes.findIndex(
        (v) => v.toString() === userId
      );
      if (voteIndex !== -1) {
        option.votes.splice(voteIndex, 1);
      }
    }

    // Add vote to selected option
    const selectedOption = post.pollOptions.find(
      (opt) => (opt as any)._id.toString() === optionId
    );

    if (!selectedOption) {
      res.status(404).json({ message: 'Poll option not found' });
      return;
    }

    selectedOption.votes.push(userId as any);
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email avatar')
      .lean();

    // Emit real-time poll update
    const io = getIO();
    io.to('feed').emit('post-updated', updatedPost);

    res.status(200).json({ success: true, post: updatedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/posts/:id
 * Update a post
 */
export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, tags } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.author.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Unauthorized to update this post' });
      return;
    }

    if (content) post.content = content;
    if (tags) post.tags = tags;
    
    await post.save();

    const updatedPost = await Post.findById(id).populate('author', 'name email avatar').lean();

    const io = getIO();
    io.to('feed').emit('post-updated', updatedPost);

    res.status(200).json({ success: true, post: updatedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.author.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Unauthorized to delete this post' });
      return;
    }

    await post.deleteOne();

    const io = getIO();
    io.to('feed').emit('post-deleted', { postId: id });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
