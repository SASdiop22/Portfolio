import { AppException } from './AppException';
import { NotFoundException } from './NotFoundException';
import { ValidationException } from './ValidationException';
import { UnauthorizedException } from './UnauthorizedException';

describe('exceptions', () => {
  it('NotFoundException has statusCode 404 and is an AppException', () => {
    const err = new NotFoundException('Education not found');
    expect(err).toBeInstanceOf(AppException);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Education not found');
  });

  it('ValidationException has statusCode 400 and carries errors', () => {
    const err = new ValidationException('Validation failed', ['title is required']);
    expect(err.statusCode).toBe(400);
    expect(err.errors).toEqual(['title is required']);
  });

  it('UnauthorizedException has statusCode 401', () => {
    const err = new UnauthorizedException('Invalid credentials');
    expect(err.statusCode).toBe(401);
  });
});
