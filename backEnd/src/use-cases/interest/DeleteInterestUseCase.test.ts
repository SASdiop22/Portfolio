import { DeleteInterestUseCase } from './DeleteInterestUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IInterestDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteInterestUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IInterestDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteInterestUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IInterestDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteInterestUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
