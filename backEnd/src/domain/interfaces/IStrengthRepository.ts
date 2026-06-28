import { StrengthModel } from '@domain/models';

export interface IStrengthRepository {
  findByOrder(): Promise<StrengthModel[]>;
}
