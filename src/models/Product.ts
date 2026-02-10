import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQty: number;
  // Image order contract: first image is main image, remaining are thumbnails.
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    stockQty: { type: Number, required: true, default: 0 },
    images: [{
      type: String,
      validate: {
        validator: function (images: string[]) {
          return !images || images.length <= 4;
        },
        message: 'A product can have at most 4 images (1 main + up to 3 thumbnails).',
      },
    }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
