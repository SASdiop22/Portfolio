import { UpdateLanguageUseCase } from './UpdateLanguageUseCase';
import { LanguageModel } from '@domain/models/Language';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ILanguageUpdater {
  update(id: string, data: Partial<LanguageModel>): Promise<LanguageModel | null>;
}

describe('UpdateLanguageUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new LanguageModel();
    const repository: ILanguageUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateLanguageUseCase(repository);

    const result = await sut.execute('1', { level: 'native' });

    expect(repository.update).toHaveBeenCalledWith('1', { level: 'native' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ILanguageUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateLanguageUseCase(repository);

    await expect(sut.execute('missing', { level: 'native' })).rejects.toThrow(NotFoundException);
  });
});
