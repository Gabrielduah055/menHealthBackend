import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'menshealth', // The name of the folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any, // Type assertion to avoid type issues with params
});

const upload = multer({ storage: storage });

export default upload;
