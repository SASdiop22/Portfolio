import { CreateLanguageUseCase } from './CreateLanguageUseCase';
import { LanguageModel } from '@domain/models/Language';

interface ILanguageCreator {
  create(data: Partial<LanguageModel>): Promise<LanguageModel>;
}

describe('CreateLanguageUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new LanguageModel();
    const repository: ILanguageCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateLanguageUseCase(repository);
    const input = { title: 'English', level: 'fluent' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
