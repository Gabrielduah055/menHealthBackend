import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  coverImageUrl: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  tags: string[];
  topics: string[];
  category: mongoose.Schema.Types.ObjectId;
  author?: {
    id?: mongoose.Schema.Types.ObjectId;
    name?: string;
    role?: string;
    avatarLabel?: string;
  };
  sections: { title: string; body: string }[];
  quote?: string;
  gallery: string[];
  readTime?: string;
  featuredLabel?: string;
  isFeatured?: boolean;
  views: number;
  allowComments: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false }
);

const authorSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    name: { type: String },
    role: { type: String },
    avatarLabel: { type: String },
  },
  { _id: false }
);

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImageUrl: { type: String },
    excerpt: { type: String },
    content: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    author: { type: authorSchema },
    sections: { type: [sectionSchema], default: [] },
    quote: { type: String },
    gallery: { type: [String], default: [] },
    topics: { type: [String], default: [] },
    readTime: { type: String },
    featuredLabel: { type: String },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
    tags: [{ type: String }],
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
