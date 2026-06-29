import { UpdateSkillUseCase } from './UpdateSkillUseCase';
import { SkillModel } from '@domain/models/Skill';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ISkillUpdater {
  update(id: string, data: Partial<SkillModel>): Promise<SkillModel | null>;
}

describe('UpdateSkillUseCase', () => {
  it('updates and returns the skill when it exists', async () => {
    const updated = new SkillModel();
    const repository: ISkillUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateSkillUseCase(repository);

    const result = await sut.execute('1', { level: 80 });

    expect(repository.update).toHaveBeenCalledWith('1', { level: 80 });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the skill does not exist', async () => {
    const repository: ISkillUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateSkillUseCase(repository);

    await expect(sut.execute('missing', { level: 50 })).rejects.toThrow(NotFoundException);
  });
});
