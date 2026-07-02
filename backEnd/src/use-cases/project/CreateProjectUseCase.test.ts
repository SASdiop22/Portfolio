import { CreateProjectUseCase } from './CreateProjectUseCase';
import { ProjectModel } from '@domain/models/Project';

interface IProjectCreator {
  create(data: Partial<ProjectModel>): Promise<ProjectModel>;
}

describe('CreateProjectUseCase', () => {
  it('creates and returns the new project', async () => {
    const created = new ProjectModel();
    const repository: IProjectCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateProjectUseCase(repository);
    const input = {
      title: 'Portfolio',
      description: 'desc',
      technologies: ['Next.js', 'TypeScript'],
    };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
