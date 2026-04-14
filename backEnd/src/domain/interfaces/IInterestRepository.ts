import { Interest } from '../models/Interest';
import { IBaseRepository } from './IBaseRepository';

export interface IInterestRepository extends IBaseRepository<Interest> {
  findByOrder(): Promise<Interest[]>;
}
