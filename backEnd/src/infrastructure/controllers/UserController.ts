import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { UserEntity } from '@infrastructure/entities/UserEntity';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { GetUserProfileUseCase } from '@use-cases/user/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@use-cases/user/UpdateUserProfileUseCase';
import { UploadUserPhotoUseCase } from '@use-cases/user/UploadUserPhotoUseCase';
import { uploadToSupabase } from '@infrastructure/storage/supabase-storage.service';

const repository = new UserRepository(AppDataSource.getRepository(UserEntity));
const getProfileUseCase = new GetUserProfileUseCase(repository);
const updateProfileUseCase = new UpdateUserProfileUseCase(repository);
const uploadPhotoUseCase = new UploadUserPhotoUseCase(repository);

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password: _password, ...profile } = await getProfileUseCase.execute();
      void _password;
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await updateProfileUseCase.execute(req.user!.userId, req.body);
      const { password: _password, ...profile } = result;
      void _password;
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file!;
      const ext = path.extname(file.originalname);
      const filename = `${req.user!.userId}-${Date.now()}${ext}`;
      const publicUrl = await uploadToSupabase(file.buffer, filename, file.mimetype);
      const result = await uploadPhotoUseCase.execute(req.user!.userId, publicUrl);
      const { password: _password, ...profile } = result;
      void _password;
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
}