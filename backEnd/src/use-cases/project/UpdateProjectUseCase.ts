import { ProjectModel } from '@domain/models/Project';
import { UpdateProjectDto } from '@infrastructure/dto/project/UpdateProjectDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IProjectUpdater {
  update(id: string, data: Partial<ProjectModel>): Promise<ProjectModel | null>;
}

export class UpdateProjectUseCase {
  constructor(private readonly repository: IProjectUpdater) {}

  async execute(id: string, data: UpdateProjectDto): Promise<ProjectModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Project not found');
    }

    return updated;
  }
}
