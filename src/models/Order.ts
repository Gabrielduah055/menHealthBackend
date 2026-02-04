import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  lineTotal: number;
}

export interface IOrderPayment {
  provider: 'paystack';
  reference: string;
  status: 'pending' | 'paid' | 'failed';
  paidAt: Date | null;
}

export interface IOrder extends Document {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'delivered';
  payment: IOrderPayment;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        nameSnapshot: { type: String, required: true },
        priceSnapshot: { type: Number, required: true },
        qty: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'delivered'],
      default: 'pending',
    },
    payment: {
      provider: { type: String, default: 'paystack' },
      reference: { type: String }, // unique index to be added
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      paidAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ 'payment.reference': 1 }, { unique: true, sparse: true });
orderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);
