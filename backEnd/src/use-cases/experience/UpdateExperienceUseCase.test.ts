import { UpdateExperienceUseCase } from './UpdateExperienceUseCase';
import { ExperienceModel } from '@domain/models/Experience';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IExperienceUpdater {
  update(id: string, data: Partial<ExperienceModel>): Promise<ExperienceModel | null>;
}

describe('UpdateExperienceUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new ExperienceModel();
    const repository: IExperienceUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateExperienceUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IExperienceUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateExperienceUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
