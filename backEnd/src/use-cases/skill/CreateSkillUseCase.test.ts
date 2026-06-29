import { CreateSkillUseCase } from './CreateSkillUseCase';
import { SkillModel } from '@domain/models/Skill';

interface ISkillCreator {
  create(data: Partial<SkillModel>): Promise<SkillModel>;
}

describe('CreateSkillUseCase', () => {
  it('creates and returns the new skill', async () => {
    const created = new SkillModel();
    const repository: ISkillCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateSkillUseCase(repository);
    const input = { title: 'TypeScript', category: 'technical' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
