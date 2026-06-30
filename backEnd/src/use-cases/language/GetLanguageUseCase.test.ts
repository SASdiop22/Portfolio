import { GetLanguageUseCase } from './GetLanguageUseCase';
import { LanguageModel } from '@domain/models/Language';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ILanguageFinder {
  findById(id: string): Promise<LanguageModel | null>;
}

describe('GetLanguageUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new LanguageModel();
    const repository: ILanguageFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetLanguageUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ILanguageFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetLanguageUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
