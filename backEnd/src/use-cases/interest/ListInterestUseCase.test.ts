import { ListInterestUseCase } from './ListInterestUseCase';
import { IInterestRepository } from '@domain/interfaces/IInterestRepository';
import { InterestModel } from '@domain/models/Interest';

describe('ListInterestUseCase', () => {
  it('returns every interest ordered by the repository', async () => {
    const entries = [new InterestModel(), new InterestModel()];
    const repository: IInterestRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListInterestUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
