import { LoginUseCase } from './LoginUseCase';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { UserModel } from '@domain/models/User';
import { UnauthorizedException } from '@shared/exceptions/UnauthorizedException';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

function buildUser(): UserModel {
  const user = new UserModel();
  user.id = '1';
  user.email = 'admin@example.com';
  user.password = 'hashed-password';
  user.firstName = 'Ada';
  user.lastName = 'Lovelace';
  return user;
}

describe('LoginUseCase', () => {
  it('returns a token and user info when credentials are valid', async () => {
    const repository: IUserRepository = { findByEmail: jest.fn().mockResolvedValue(buildUser()) };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const sut = new LoginUseCase(repository);

    const result = await sut.execute({ email: 'admin@example.com', password: 'plain-password' });

    expect(result.user).toEqual({ id: '1', email: 'admin@example.com', firstName: 'Ada', lastName: 'Lovelace' });
    expect(typeof result.token).toBe('string');
  });

  it('throws UnauthorizedException when the email is not found', async () => {
    const repository: IUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const sut = new LoginUseCase(repository);

    await expect(sut.execute({ email: 'nobody@example.com', password: 'x' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when the password does not match', async () => {
    const repository: IUserRepository = { findByEmail: jest.fn().mockResolvedValue(buildUser()) };
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const sut = new LoginUseCase(repository);

    await expect(sut.execute({ email: 'admin@example.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
