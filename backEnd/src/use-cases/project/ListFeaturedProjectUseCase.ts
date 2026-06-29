import { IProjectRepository } from '@domain/interfaces/IProjectRepository';
import { ProjectModel } from '@domain/models/Project';

export class ListFeaturedProjectUseCase {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(): Promise<ProjectModel[]> {
    return this.repository.findFeatured();
  }
}
