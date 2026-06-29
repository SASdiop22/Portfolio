import { Request, Response } from 'express';
import { errorMiddleware } from './error.middleware';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('errorMiddleware', () => {
  it('responds with the exception statusCode and message for an AppException', () => {
    const res = mockResponse();
    const err = new NotFoundException('Education not found');

    errorMiddleware(err, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Education not found' });
  });

  it('responds with 500 for an unrecognized error', () => {
    const res = mockResponse();
    const err = new Error('boom');

    errorMiddleware(err, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Erreur interne du serveur' }),
    );
  });
});
