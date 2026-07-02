import { StrengthModel } from '@domain/models/Strength';

export interface IStrengthRepository {
  findByOrder(): Promise<StrengthModel[]>;
}
