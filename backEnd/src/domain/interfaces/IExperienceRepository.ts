import { Experience } from '../models/Experience';
import { IBaseRepository } from './IBaseRepository';

export interface IExperienceRepository extends IBaseRepository<Experience> {
  findByOrder(): Promise<Experience[]>;
  findCurrent(): Promise<Experience[]>;
}
