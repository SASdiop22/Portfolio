import { Education } from '../models/Education';
import { IBaseRepository } from './IBaseRepository';

export interface IEducationRepository extends IBaseRepository<Education> {
  findByOrder(): Promise<Education[]>;
  findCurrent(): Promise<Education[]>;
}
