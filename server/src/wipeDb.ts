import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post';
import Comment from './models/Comment';
import connectDB from './config/db';

dotenv.config();

const wipe = async () => {
  try {
    await connectDB();
    console.log('Wiping all posts and comments...');
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Successfully wiped old posts and comments!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to wipe data:', error);
    process.exit(1);
  }
};

wipe();
