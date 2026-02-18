import crypto from 'crypto';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';

const generateToken = (id: string): string => {
    return jwt.sign({ id, role: 'user' }, process.env.JWT_SECRET || 'fallback', {
        expiresIn: '30d',
    });
};

const generateCode = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
};

// POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password, phone, dateOfBirth, location } = req.body;

    if (!fullName || !email || !password) {
        res.status(400);
        throw new Error('Full name, email, and password are required.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        res.status(400);
        throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationCode = generateCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || '',
        dateOfBirth: dateOfBirth || undefined,
        location: location || '',
        verificationCode,
        verificationCodeExpires,
    });

    try {
        await sendVerificationEmail(user.email, verificationCode);
    } catch (err) {
        console.error('Failed to send verification email:', err);
    }

    res.status(201).json({
        message: 'Account created. Please check your email for the verification code.',
        email: user.email,
    });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400);
        throw new Error('Email and verification code are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Email is already verified.');
    }

    if (
        user.verificationCode !== code ||
        !user.verificationCodeExpires ||
        user.verificationCodeExpires < new Date()
    ) {
        res.status(400);
        throw new Error('Invalid or expired verification code.');
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = generateToken(user._id.toString());

    res.json({
        message: 'Email verified successfully.',
        token,
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profilePhoto: user.profilePhoto,
            isVerified: user.isVerified,
        },
    });
});

// POST /api/auth/resend-code
export const resendCode = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Email is already verified.');
    }

    const verificationCode = generateCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
        await sendVerificationEmail(user.email, verificationCode);
    } catch (err) {
        console.error('Failed to resend verification email:', err);
    }

    res.json({ message: 'Verification code resent. Please check your email.' });
});

// POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password.');
    }

    if (!user.isVerified) {
        // Resend verification code
        const verificationCode = generateCode();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            await sendVerificationEmail(user.email, verificationCode);
        } catch (err) {
            console.error('Failed to send verification email:', err);
        }

        res.status(403).json({
            message: 'Email not verified. A new verification code has been sent.',
            requiresVerification: true,
            email: user.email,
        });
        return;
    }

    const token = generateToken(user._id.toString());

    res.json({
        token,
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profilePhoto: user.profilePhoto,
            isVerified: user.isVerified,
        },
    });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Don't reveal if user exists
        res.json({ message: 'If an account exists for this email, a reset code has been sent.' });
        return;
    }

    const resetCode = generateCode();
    user.resetCode = resetCode;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
        await sendPasswordResetEmail(user.email, resetCode);
    } catch (err) {
        console.error('Failed to send password reset email:', err);
    }

    res.json({ message: 'If an account exists for this email, a reset code has been sent.' });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        res.status(400);
        throw new Error('Email, code, and new password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (
        user.resetCode !== code ||
        !user.resetCodeExpires ||
        user.resetCodeExpires < new Date()
    ) {
        res.status(400);
        throw new Error('Invalid or expired reset code.');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        res.status(401);
        throw new Error('Not authenticated.');
    }

    res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        location: user.location,
        isVerified: user.isVerified,
    });
});
