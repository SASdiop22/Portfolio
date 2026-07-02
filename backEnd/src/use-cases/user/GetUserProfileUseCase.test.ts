import { GetUserProfileUseCase } from './GetUserProfileUseCase';
import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IUserLister {
  findAll(): Promise<UserModel[]>;
}

describe('GetUserProfileUseCase', () => {
  it('returns the one existing user', async () => {
    const user = new UserModel();
    const repository: IUserLister = { findAll: jest.fn().mockResolvedValue([user]) };
    const sut = new GetUserProfileUseCase(repository);

    const result = await sut.execute();

    expect(result).toBe(user);
  });

  it('throws NotFoundException when no user exists yet', async () => {
    const repository: IUserLister = { findAll: jest.fn().mockResolvedValue([]) };
    const sut = new GetUserProfileUseCase(repository);

    await expect(sut.execute()).rejects.toThrow(NotFoundException);
  });
});
