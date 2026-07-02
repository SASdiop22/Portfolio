import { ListEducationUseCase } from './ListEducationUseCase';
import { IEducationRepository } from '@domain/interfaces/IEducationRepository';
import { EducationModel } from '@domain/models/Education';

describe('ListEducationUseCase', () => {
  it('returns every education entry ordered by the repository', async () => {
    const entries = [new EducationModel(), new EducationModel()];
    const repository: IEducationRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findCurrent: jest.fn(),
    };
    const sut = new ListEducationUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
