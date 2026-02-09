import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import AdminUser from '../models/AdminUser';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // #region agent log
  try { require('fs').appendFileSync('c:\\Users\\AGYEMANG\\itagtip\\mensHealth\\.cursor\\debug.log', JSON.stringify({location:'authController.ts:loginAdmin',message:'Login attempt received',data:{email},timestamp:Date.now()}) + '\n'); } catch (e) {}
  // #endregion

  const admin = await AdminUser.findOne({ email });

  // #region agent log
  try { require('fs').appendFileSync('c:\\Users\\AGYEMANG\\itagtip\\mensHealth\\.cursor\\debug.log', JSON.stringify({location:'authController.ts:loginAdmin',message:'User lookup result',data:{found: !!admin, hasHash: !!admin?.passwordHash},timestamp:Date.now()}) + '\n'); } catch (e) {}
  // #endregion

  if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
    // #region agent log
    try { require('fs').appendFileSync('c:\\Users\\AGYEMANG\\itagtip\\mensHealth\\.cursor\\debug.log', JSON.stringify({location:'authController.ts:loginAdmin',message:'Password verified',data:{},timestamp:Date.now()}) + '\n'); } catch (e) {}
    // #endregion
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id.toString()),
    });
  } else {
    // #region agent log
    try { require('fs').appendFileSync('c:\\Users\\AGYEMANG\\itagtip\\mensHealth\\.cursor\\debug.log', JSON.stringify({location:'authController.ts:loginAdmin',message:'Login failed',data:{reason: !admin ? 'User not found' : 'Password mismatch'},timestamp:Date.now()}) + '\n'); } catch (e) {}
    // #endregion
    res.status(401);
    throw new Error('Invalid email or password');
  }
});
