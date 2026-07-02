import { GetExperienceUseCase } from './GetExperienceUseCase';
import { ExperienceModel } from '@domain/models/Experience';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IExperienceFinder {
  findById(id: string): Promise<ExperienceModel | null>;
}

describe('GetExperienceUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new ExperienceModel();
    const repository: IExperienceFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetExperienceUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IExperienceFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetExperienceUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
