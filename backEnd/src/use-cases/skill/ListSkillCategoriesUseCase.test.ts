import { ListSkillCategoriesUseCase } from './ListSkillCategoriesUseCase';
import { ISkillRepository } from '@domain/interfaces/ISkillRepository';

describe('ListSkillCategoriesUseCase', () => {
  it('returns the distinct category list', async () => {
    const repository: ISkillRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn(),
      findAllCategories: jest.fn().mockResolvedValue(['technical', 'tools']),
    };
    const sut = new ListSkillCategoriesUseCase(repository);

    const result = await sut.execute();

    expect(repository.findAllCategories).toHaveBeenCalled();
    expect(result).toEqual(['technical', 'tools']);
  });
});
