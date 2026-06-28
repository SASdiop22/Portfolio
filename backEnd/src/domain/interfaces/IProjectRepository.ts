import { ProjectModel } from '../models/Project';

export interface IProjectRepository {
  findFeatured(): Promise<ProjectModel[]>;
  findByOrder(): Promise<ProjectModel[]>;
}
