import { DeleteExperienceUseCase } from './DeleteExperienceUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IExperienceDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteExperienceUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IExperienceDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteExperienceUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IExperienceDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteExperienceUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
