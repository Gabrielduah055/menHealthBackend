import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  shareToken: string;
  shareCount: number;
  replies: {
    name: string;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'BlogPost', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    shareToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    shareCount: { type: Number, default: 0 },
    replies: [
      {
        name: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, postId: 1 });

export default mongoose.model<IComment>('Comment', commentSchema);
