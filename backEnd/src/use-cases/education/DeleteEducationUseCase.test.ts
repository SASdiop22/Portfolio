import { DeleteEducationUseCase } from './DeleteEducationUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteEducationUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteEducationUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteEducationUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
