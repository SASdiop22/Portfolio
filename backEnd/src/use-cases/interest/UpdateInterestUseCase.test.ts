import { UpdateInterestUseCase } from './UpdateInterestUseCase';
import { InterestModel } from '@domain/models/Interest';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IInterestUpdater {
  update(id: string, data: Partial<InterestModel>): Promise<InterestModel | null>;
}

describe('UpdateInterestUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new InterestModel();
    const repository: IInterestUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateInterestUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IInterestUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateInterestUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
