import { EducationModel } from '@domain/models/Education';

export interface IEducationRepository {
  findByOrder(): Promise<EducationModel[]>;
  findCurrent(): Promise<EducationModel[]>;
}
