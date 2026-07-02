import { DeleteSkillUseCase } from './DeleteSkillUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ISkillDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteSkillUseCase', () => {
  it('deletes when the skill exists', async () => {
    const repository: ISkillDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteSkillUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the skill does not exist', async () => {
    const repository: ISkillDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteSkillUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
