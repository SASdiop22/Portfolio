import { ListStrengthUseCase } from './ListStrengthUseCase';
import { IStrengthRepository } from '@domain/interfaces/IStrengthRepository';
import { StrengthModel } from '@domain/models/Strength';

describe('ListStrengthUseCase', () => {
  it('returns every strength ordered by the repository', async () => {
    const entries = [new StrengthModel(), new StrengthModel()];
    const repository: IStrengthRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListStrengthUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
