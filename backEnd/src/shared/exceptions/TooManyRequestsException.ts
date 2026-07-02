import { AppException } from './AppException';

export class TooManyRequestsException extends AppException {
  constructor(message: string) {
    super(message, 429);
  }
}