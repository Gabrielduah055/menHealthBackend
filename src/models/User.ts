import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    fullName: string;
    email: string;
    passwordHash: string;
    phone?: string;
    dateOfBirth?: Date;
    location?: string;
    profilePhoto?: string;
    isVerified: boolean;
    verificationCode?: string;
    verificationCodeExpires?: Date;
    resetCode?: string;
    resetCodeExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        phone: { type: String, default: '' },
        dateOfBirth: { type: Date },
        location: { type: String, default: '' },
        profilePhoto: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        verificationCode: { type: String },
        verificationCodeExpires: { type: Date },
        resetCode: { type: String },
        resetCodeExpires: { type: Date },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', userSchema);
