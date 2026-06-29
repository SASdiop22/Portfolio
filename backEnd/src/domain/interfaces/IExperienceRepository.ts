import { ExperienceModel } from '@domain/models/Experience';

export interface IExperienceRepository {
  findByOrder(): Promise<ExperienceModel[]>;
  findCurrent(): Promise<ExperienceModel[]>;
}
