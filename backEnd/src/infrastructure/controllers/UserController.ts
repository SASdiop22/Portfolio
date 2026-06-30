import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { UserEntity } from '@infrastructure/entities/UserEntity';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { GetUserProfileUseCase } from '@use-cases/user/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@use-cases/user/UpdateUserProfileUseCase';
import { UploadUserPhotoUseCase } from '@use-cases/user/UploadUserPhotoUseCase';
import { envConfig } from '@config/env.config';

const repository = new UserRepository(AppDataSource.getRepository(UserEntity));
const getProfileUseCase = new GetUserProfileUseCase(repository);
const updateProfileUseCase = new UpdateUserProfileUseCase(repository);
const uploadPhotoUseCase = new UploadUserPhotoUseCase(repository, envConfig.upload.uploadPath);

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getProfileUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await updateProfileUseCase.execute(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await uploadPhotoUseCase.execute(req.user!.userId, req.file!.filename);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
