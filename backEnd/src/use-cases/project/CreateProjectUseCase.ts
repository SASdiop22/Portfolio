import { ProjectModel } from '@domain/models/Project';
import { CreateProjectDto } from '@infrastructure/dto/project/CreateProjectDto';

export interface IProjectCreator {
  create(data: Partial<ProjectModel>): Promise<ProjectModel>;
}

export class CreateProjectUseCase {
  constructor(private readonly repository: IProjectCreator) {}

  async execute(data: CreateProjectDto): Promise<ProjectModel> {
    return this.repository.create(data);
  }
}
