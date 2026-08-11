import mongoose, { Document, Schema } from 'mongoose';

export type AuthProvider = 'google' | 'oracle' | 'both';

export interface IUser extends Document {
  googleId?: string;
  oracleId?: string;
  authProvider: AuthProvider;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents with null/undefined googleId
      index: true,
    },
    oracleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents with null/undefined oracleId
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['google', 'oracle', 'both'],
      default: 'google',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
