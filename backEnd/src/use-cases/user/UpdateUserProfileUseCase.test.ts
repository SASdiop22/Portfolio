import { UpdateUserProfileUseCase } from './UpdateUserProfileUseCase';
import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IUserUpdater {
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

describe('UpdateUserProfileUseCase', () => {
  it('updates and returns the user when it exists', async () => {
    const updated = new UserModel();
    const repository: IUserUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateUserProfileUseCase(repository);

    const result = await sut.execute('1', { tagline: 'New tagline' });

    expect(repository.update).toHaveBeenCalledWith('1', { tagline: 'New tagline' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the user does not exist', async () => {
    const repository: IUserUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateUserProfileUseCase(repository);

    await expect(sut.execute('missing', { tagline: 'X' })).rejects.toThrow(NotFoundException);
  });
});
