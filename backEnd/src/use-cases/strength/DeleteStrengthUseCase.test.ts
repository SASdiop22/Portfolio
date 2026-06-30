import { DeleteStrengthUseCase } from './DeleteStrengthUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IStrengthDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteStrengthUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IStrengthDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteStrengthUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IStrengthDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteStrengthUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
