import { InterestModel } from '../models/Interest';

export interface IInterestRepository {
  findByOrder(): Promise<InterestModel[]>;
}
