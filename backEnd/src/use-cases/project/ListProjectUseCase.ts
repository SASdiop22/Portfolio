import { IProjectRepository } from '@domain/interfaces/IProjectRepository';
import { ProjectModel } from '@domain/models/Project';

export class ListProjectUseCase {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(): Promise<ProjectModel[]> {
    return this.repository.findByOrder();
  }
}
