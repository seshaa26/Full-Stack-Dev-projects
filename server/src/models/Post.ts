import mongoose, { Document, Schema, Types } from 'mongoose';

// Subdocument interfaces
export interface IPollOption {
  optionText: string;
  votes: Types.ObjectId[];
}

export interface IReaction {
  user: Types.ObjectId;
  type: 'like' | 'insightful' | 'fire' | 'code';
}

export interface IPost extends Document {
  author: Types.ObjectId;
  type: 'discussion' | 'poll' | 'announcement' | 'article' | 'event';
  title?: string;
  content: string;
  mediaUrl?: string;
  tags: string[];
  pollOptions: IPollOption[];
  reactions: IReaction[];
  bookmarks: Types.ObjectId[];
  eventDate?: Date;
  eventLink?: string;
  attendees?: Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
}

const pollOptionSchema = new Schema<IPollOption>(
  {
    optionText: {
      type: String,
      required: true,
      trim: true,
    },
    votes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { _id: true }
);

const reactionSchema = new Schema<IReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'insightful', 'fire', 'code'],
      required: true,
    },
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['discussion', 'poll', 'announcement', 'article', 'event'],
      required: true,
      default: 'discussion',
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15000, // increased for articles
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    pollOptions: {
      type: [pollOptionSchema],
      default: [],
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    eventDate: {
      type: Date,
    },
    eventLink: {
      type: String,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient feed queries
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1, createdAt: -1 });

const Post = mongoose.model<IPost>('Post', postSchema);
export default Post;
