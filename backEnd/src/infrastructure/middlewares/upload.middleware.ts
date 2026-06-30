import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { envConfig } from '@config/env.config';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, envConfig.upload.uploadPath);
  },
  filename: (req: Request, file, callback) => {
    const userId = req.user?.userId ?? 'unknown';
    const extension = path.extname(file.originalname);
    callback(null, `${userId}-${Date.now()}${extension}`);
  },
});

function fileFilter(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowed.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error('Only JPEG, PNG, or WEBP images are allowed'));
}

export const uploadUserPhoto = multer({
  storage,
  limits: { fileSize: envConfig.upload.maxFileSize },
  fileFilter,
});
