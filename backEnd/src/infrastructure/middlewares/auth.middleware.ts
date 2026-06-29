import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '@config/env.config';
import { UnauthorizedException } from '@shared/exceptions/UnauthorizedException';
import { AuthenticatedUser } from './express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new UnauthorizedException('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, envConfig.jwt.secret) as AuthenticatedUser;
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedException('Invalid or expired token'));
  }
}
