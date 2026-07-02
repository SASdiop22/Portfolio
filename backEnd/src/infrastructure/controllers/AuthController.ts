import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@use-cases/auth/LoginUseCase';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { UserEntity } from '@infrastructure/entities/UserEntity';
import { BruteForceProtection } from '@infrastructure/security/BruteForceProtection';
import { SecurityLogger } from '@infrastructure/security/SecurityLogger';
import { TooManyRequestsException } from '@shared/exceptions/TooManyRequestsException';

const userRepository = new UserRepository(AppDataSource.getRepository(UserEntity));
const loginUseCase = new LoginUseCase(userRepository);

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = req.ip ?? 'unknown';
    const ua = req.headers['user-agent'] ?? 'unknown';
    const { email, password } = req.body as { email: string; password: string };

    try {
      if (BruteForceProtection.isLocked(ip)) {
        const remaining = Math.ceil(BruteForceProtection.getRemainingLockMs(ip) / 60000);
        SecurityLogger.authLockout(ip, ua, email);
        next(new TooManyRequestsException(`Compte bloqué. Réessayez dans ${remaining} minute(s).`));
        return;
      }

      const result = await loginUseCase.execute({ email, password });

      BruteForceProtection.recordSuccess(ip);
      SecurityLogger.authSuccess(ip, ua, email);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if ((error as Error).name === 'UnauthorizedException') {
        BruteForceProtection.recordFailure(ip);
        const attempts = BruteForceProtection.getAttemptCount(ip);
        SecurityLogger.authFailure(ip, ua, email, `attempt ${attempts}/5`);
      }
      next(error);
    }
  }
}