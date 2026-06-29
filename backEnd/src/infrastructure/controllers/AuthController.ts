import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@use-cases/auth/LoginUseCase';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { UserEntity } from '@infrastructure/entities/UserEntity';

const userRepository = new UserRepository(AppDataSource.getRepository(UserEntity));
const loginUseCase = new LoginUseCase(userRepository);

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await loginUseCase.execute(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
