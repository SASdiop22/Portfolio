import { GetCurrentEducationUseCase } from './GetCurrentEducationUseCase';
import { IEducationRepository } from '@domain/interfaces/IEducationRepository';
import { EducationModel } from '@domain/models/Education';

describe('GetCurrentEducationUseCase', () => {
  it('returns only the current education entries', async () => {
    const entries = [new EducationModel()];
    const repository: IEducationRepository = {
      findByOrder: jest.fn(),
      findCurrent: jest.fn().mockResolvedValue(entries),
    };
    const sut = new GetCurrentEducationUseCase(repository);

    const result = await sut.execute();

    expect(repository.findCurrent).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
