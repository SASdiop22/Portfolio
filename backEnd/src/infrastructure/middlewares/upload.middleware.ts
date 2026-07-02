import multer from 'multer';
import type { Request } from 'express';
import { envConfig } from '@config/env.config';

function fileFilter(
  _req: Request,
  _file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(_file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new Error('Only JPEG, PNG, or WEBP images are allowed'));
}

export const uploadUserPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: envConfig.upload.maxFileSize },
  fileFilter,
});