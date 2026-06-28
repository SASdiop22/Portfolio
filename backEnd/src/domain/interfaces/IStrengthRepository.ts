import { StrengthModel } from '../models/Strength';

export interface IStrengthRepository {
  findByOrder(): Promise<StrengthModel[]>;
}
