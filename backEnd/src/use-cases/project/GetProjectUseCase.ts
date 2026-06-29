import { ProjectModel } from '@domain/models/Project';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IProjectFinder {
  findById(id: string): Promise<ProjectModel | null>;
}

export class GetProjectUseCase {
  constructor(private readonly repository: IProjectFinder) {}

  async execute(id: string): Promise<ProjectModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Project not found');
    }

    return entry;
  }
}
