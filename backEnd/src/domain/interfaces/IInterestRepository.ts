import { InterestModel } from '@domain/models';

export interface IInterestRepository {
  findByOrder(): Promise<InterestModel[]>;
}
