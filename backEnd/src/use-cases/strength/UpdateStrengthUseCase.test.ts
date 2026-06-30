import { UpdateStrengthUseCase } from './UpdateStrengthUseCase';
import { StrengthModel } from '@domain/models/Strength';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IStrengthUpdater {
  update(id: string, data: Partial<StrengthModel>): Promise<StrengthModel | null>;
}

describe('UpdateStrengthUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new StrengthModel();
    const repository: IStrengthUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateStrengthUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IStrengthUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateStrengthUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
