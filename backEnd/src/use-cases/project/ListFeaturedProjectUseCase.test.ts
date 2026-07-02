import { ListFeaturedProjectUseCase } from './ListFeaturedProjectUseCase';
import { IProjectRepository } from '@domain/interfaces/IProjectRepository';
import { ProjectModel } from '@domain/models/Project';

describe('ListFeaturedProjectUseCase', () => {
  it('returns only the featured projects', async () => {
    const entries = [new ProjectModel()];
    const repository: IProjectRepository = {
      findByOrder: jest.fn(),
      findFeatured: jest.fn().mockResolvedValue(entries),
    };
    const sut = new ListFeaturedProjectUseCase(repository);

    const result = await sut.execute();

    expect(repository.findFeatured).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
