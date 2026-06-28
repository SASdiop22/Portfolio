import { ExperienceModel } from '../models/Experience';
import { IBaseRepository } from './IBaseRepository';

export interface IExperienceRepository {
  findByOrder(): Promise<ExperienceModel[]>;
  findCurrent(): Promise<ExperienceModel[]>;
}
