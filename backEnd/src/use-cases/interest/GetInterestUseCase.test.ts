import { GetInterestUseCase } from './GetInterestUseCase';
import { InterestModel } from '@domain/models/Interest';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IInterestFinder {
  findById(id: string): Promise<InterestModel | null>;
}

describe('GetInterestUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new InterestModel();
    const repository: IInterestFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetInterestUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IInterestFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetInterestUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
