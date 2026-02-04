import { IAdminUser } from '../models/AdminUser';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdminUser;
    }
  }
}
