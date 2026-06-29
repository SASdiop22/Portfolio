import { Request, Response, NextFunction } from 'express';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate as classValidatorValidate } from 'class-validator';
import { ValidationException } from '@shared/exceptions/ValidationException';

export function validate<T extends object>(DtoClass: ClassConstructor<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await classValidatorValidate(instance);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      next(new ValidationException('Validation failed', messages));
      return;
    }

    req.body = instance;
    next();
  };
}
