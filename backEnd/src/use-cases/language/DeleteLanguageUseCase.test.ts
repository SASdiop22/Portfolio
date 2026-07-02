import { DeleteLanguageUseCase } from './DeleteLanguageUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ILanguageDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteLanguageUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: ILanguageDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteLanguageUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ILanguageDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteLanguageUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
