import { EducationModel } from '../models/Education';

export interface IEducationRepository {
  findByOrder(): Promise<EducationModel[]>;
  findCurrent(): Promise<EducationModel[]>;
}
