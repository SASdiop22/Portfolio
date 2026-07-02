import { ListProjectUseCase } from './ListProjectUseCase';
import { IProjectRepository } from '@domain/interfaces/IProjectRepository';
import { ProjectModel } from '@domain/models/Project';

describe('ListProjectUseCase', () => {
  it('returns every project ordered by the repository', async () => {
    const entries = [new ProjectModel(), new ProjectModel()];
    const repository: IProjectRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findFeatured: jest.fn(),
    };
    const sut = new ListProjectUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
