import { ProjectModel } from '@domain/models/Project';

export interface IProjectRepository {
  findFeatured(): Promise<ProjectModel[]>;
  findByOrder(): Promise<ProjectModel[]>;
}
