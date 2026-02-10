import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  coverImageUrl: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  tags: string[];
  category: mongoose.Schema.Types.ObjectId;
  views: number;
  allowComments: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImageUrl: { type: String },
    excerpt: { type: String },
    content: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    views: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
    tags: [{ type: String }],
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
