import { GetCurrentExperienceUseCase } from './GetCurrentExperienceUseCase';
import { IExperienceRepository } from '@domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '@domain/models/Experience';

describe('GetCurrentExperienceUseCase', () => {
  it('returns only the current experience entries', async () => {
    const entries = [new ExperienceModel()];
    const repository: IExperienceRepository = {
      findByOrder: jest.fn(),
      findCurrent: jest.fn().mockResolvedValue(entries),
    };
    const sut = new GetCurrentExperienceUseCase(repository);

    const result = await sut.execute();

    expect(repository.findCurrent).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
