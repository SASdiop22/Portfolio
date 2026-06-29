import { GetProjectUseCase } from './GetProjectUseCase';
import { ProjectModel } from '@domain/models/Project';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IProjectFinder {
  findById(id: string): Promise<ProjectModel | null>;
}

describe('GetProjectUseCase', () => {
  it('returns the project when it exists', async () => {
    const entry = new ProjectModel();
    const repository: IProjectFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetProjectUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the project does not exist', async () => {
    const repository: IProjectFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetProjectUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
