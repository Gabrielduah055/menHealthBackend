import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined');
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = await AdminUser.findById(decoded.id).select('-passwordHash');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.admin && req.admin.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

export const protectUser = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined');
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'user') {
        res.status(401);
        throw new Error('Not authorized as a user');
      }

      const user = await User.findById(decoded.id).select('-passwordHash -verificationCode -verificationCodeExpires -resetCode -resetCodeExpires');
      if (!user) {
        res.status(401);
        throw new Error('User not found');
      }

      (req as any).user = user;
      next();
      return;
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

