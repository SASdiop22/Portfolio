import { DeleteProjectUseCase } from './DeleteProjectUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IProjectDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteProjectUseCase', () => {
  it('deletes when the project exists', async () => {
    const repository: IProjectDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteProjectUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the project does not exist', async () => {
    const repository: IProjectDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteProjectUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
