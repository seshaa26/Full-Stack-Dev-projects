import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching comments by post, sorted by creation time
commentSchema.index({ post: 1, createdAt: -1 });

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
