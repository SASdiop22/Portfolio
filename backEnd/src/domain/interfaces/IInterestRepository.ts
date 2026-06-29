import { InterestModel } from '@domain/models/Interest';

export interface IInterestRepository {
  findByOrder(): Promise<InterestModel[]>;
}
