import { GetStrengthUseCase } from './GetStrengthUseCase';
import { StrengthModel } from '@domain/models/Strength';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IStrengthFinder {
  findById(id: string): Promise<StrengthModel | null>;
}

describe('GetStrengthUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new StrengthModel();
    const repository: IStrengthFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetStrengthUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IStrengthFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetStrengthUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
