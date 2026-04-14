import { Project } from '../models/Project';
import { IBaseRepository } from './IBaseRepository';

export interface IProjectRepository extends IBaseRepository<Project> {
  findFeatured(): Promise<Project[]>;
  findByOrder(): Promise<Project[]>;
}
