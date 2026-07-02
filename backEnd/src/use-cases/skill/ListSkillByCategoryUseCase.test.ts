import { ListSkillByCategoryUseCase } from './ListSkillByCategoryUseCase';
import { ISkillRepository } from '@domain/interfaces/ISkillRepository';
import { SkillModel } from '@domain/models/Skill';

describe('ListSkillByCategoryUseCase', () => {
  it('returns skills filtered by category', async () => {
    const entries = [new SkillModel()];
    const repository: ISkillRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn().mockResolvedValue(entries),
      findAllCategories: jest.fn(),
    };
    const sut = new ListSkillByCategoryUseCase(repository);

    const result = await sut.execute('tools');

    expect(repository.findByCategory).toHaveBeenCalledWith('tools');
    expect(result).toBe(entries);
  });
});
