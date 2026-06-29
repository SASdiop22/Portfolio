import { AppException } from './AppException';

export class ValidationException extends AppException {
  public readonly errors: string[];

  constructor(message: string, errors: string[]) {
    super(message, 400);
    this.errors = errors;
  }
}
