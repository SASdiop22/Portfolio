import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.middleware';
import { UnauthorizedException } from '@shared/exceptions/UnauthorizedException';
import { envConfig } from '@config/env.config';

describe('authMiddleware', () => {
  it('calls next() and sets req.user when the token is valid', () => {
    const token = jwt.sign({ userId: '1', email: 'a@b.com' }, envConfig.jwt.secret);
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const next = jest.fn();

    authMiddleware(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(expect.objectContaining({ userId: '1', email: 'a@b.com' }));
  });

  it('calls next() with UnauthorizedException when no header is present', () => {
    const req = { headers: {} } as unknown as Request;
    const next = jest.fn();

    authMiddleware(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });

  it('calls next() with UnauthorizedException when the token is invalid', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as unknown as Request;
    const next = jest.fn();

    authMiddleware(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });
});
