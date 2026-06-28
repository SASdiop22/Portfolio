import { EducationModel } from '@domain/models';

export interface IEducationRepository {
  findByOrder(): Promise<EducationModel[]>;
  findCurrent(): Promise<EducationModel[]>;
}
