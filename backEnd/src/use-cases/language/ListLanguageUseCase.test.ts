import { ListLanguageUseCase } from './ListLanguageUseCase';
import { ILanguageRepository } from '@domain/interfaces/ILanguageRepository';
import { LanguageModel } from '@domain/models/Language';

describe('ListLanguageUseCase', () => {
  it('returns every language ordered by the repository', async () => {
    const entries = [new LanguageModel(), new LanguageModel()];
    const repository: ILanguageRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListLanguageUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
