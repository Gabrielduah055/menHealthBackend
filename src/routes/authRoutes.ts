import express from 'express';
import { loginAdmin } from '../controllers/authController';
// import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/login', loginAdmin);

export default router;
