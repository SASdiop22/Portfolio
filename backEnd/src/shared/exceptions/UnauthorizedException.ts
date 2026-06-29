import { AppException } from './AppException';

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(message, 401);
  }
}
