import { ListSkillUseCase } from './ListSkillUseCase';
import { ISkillRepository } from '@domain/interfaces/ISkillRepository';
import { SkillModel } from '@domain/models/Skill';

describe('ListSkillUseCase', () => {
  it('returns every skill ordered by the repository', async () => {
    const entries = [new SkillModel(), new SkillModel()];
    const repository: ISkillRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findByCategory: jest.fn(),
      findAllCategories: jest.fn(),
    };
    const sut = new ListSkillUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
