import { Request, Response, NextFunction } from 'express';
import { AppException } from '@shared/exceptions/AppException';
import { ValidationException } from '@shared/exceptions/ValidationException';
import { envConfig } from '@config/env.config';

// Express identifies error-handling middleware by its 4-argument arity, so `next`
// must stay in the signature even though it's unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ValidationException) {
    res.status(err.statusCode).json({ success: false, message: err.message, errors: err.errors });
    return;
  }

  if (err instanceof AppException) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  console.error('❌ Erreur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: envConfig.nodeEnv === 'development' ? err.message : undefined,
  });
}
