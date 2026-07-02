import { DeleteNewsUseCase } from './DeleteNewsUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface INewsDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteNewsUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: INewsDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteNewsUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: INewsDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteNewsUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
