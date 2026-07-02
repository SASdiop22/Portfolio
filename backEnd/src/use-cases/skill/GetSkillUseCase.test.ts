import { GetSkillUseCase } from './GetSkillUseCase';
import { SkillModel } from '@domain/models/Skill';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ISkillFinder {
  findById(id: string): Promise<SkillModel | null>;
}

describe('GetSkillUseCase', () => {
  it('returns the skill when it exists', async () => {
    const entry = new SkillModel();
    const repository: ISkillFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetSkillUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the skill does not exist', async () => {
    const repository: ISkillFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetSkillUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
