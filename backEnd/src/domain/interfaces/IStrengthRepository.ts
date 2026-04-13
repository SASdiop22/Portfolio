import { Strength } from '../models/Strength';
import { IBaseRepository } from './IBaseRepository';

export interface IStrengthRepository extends IBaseRepository<Strength> {
  findByOrder(): Promise<Strength[]>;
}
