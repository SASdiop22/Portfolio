import { ListExperienceUseCase } from './ListExperienceUseCase';
import { IExperienceRepository } from '@domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '@domain/models/Experience';

describe('ListExperienceUseCase', () => {
  it('returns every experience entry ordered by the repository', async () => {
    const entries = [new ExperienceModel(), new ExperienceModel()];
    const repository: IExperienceRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findCurrent: jest.fn(),
    };
    const sut = new ListExperienceUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
