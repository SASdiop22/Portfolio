import { UpdateEducationUseCase } from './UpdateEducationUseCase';
import { EducationModel } from '@domain/models/Education';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IUpdater {
  update(id: string, data: Partial<EducationModel>): Promise<EducationModel | null>;
}

describe('UpdateEducationUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new EducationModel();
    const repository: IUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateEducationUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateEducationUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
