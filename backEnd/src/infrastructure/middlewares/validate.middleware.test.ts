import { Request, Response, NextFunction } from 'express';
import { IsString, IsNotEmpty } from 'class-validator';
import { validate } from './validate.middleware';
import { ValidationException } from '@shared/exceptions/ValidationException';

class TestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

describe('validate middleware', () => {
  it('calls next() when the body satisfies the DTO', async () => {
    const req = { body: { title: 'Hello' } } as Request;
    const next = jest.fn();

    await validate(TestDto)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toBeInstanceOf(TestDto);
  });

  it('calls next() with a ValidationException when the body fails the DTO', async () => {
    const req = { body: { title: '' } } as Request;
    const next = jest.fn();

    await validate(TestDto)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationException));
  });

  it('calls next() with a ValidationException instead of throwing when req.body is undefined', async () => {
    const req = { body: undefined } as Request;
    const next = jest.fn();

    await validate(TestDto)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationException));
  });
});
