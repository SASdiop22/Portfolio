import { ProjectModel } from '@domain/models';

export interface IProjectRepository {
  findFeatured(): Promise<ProjectModel[]>;
  findByOrder(): Promise<ProjectModel[]>;
}
