import { ExperienceModel } from '../models/Experience';

export interface IExperienceRepository {
  findByOrder(): Promise<ExperienceModel[]>;
  findCurrent(): Promise<ExperienceModel[]>;
}
