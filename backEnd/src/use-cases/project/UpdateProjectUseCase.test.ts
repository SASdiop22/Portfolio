import { UpdateProjectUseCase } from './UpdateProjectUseCase';
import { ProjectModel } from '@domain/models/Project';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IProjectUpdater {
  update(id: string, data: Partial<ProjectModel>): Promise<ProjectModel | null>;
}

describe('UpdateProjectUseCase', () => {
  it('updates and returns the project when it exists', async () => {
    const updated = new ProjectModel();
    const repository: IProjectUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateProjectUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the project does not exist', async () => {
    const repository: IProjectUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateProjectUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
