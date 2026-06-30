import { IInterestRepository } from '@domain/interfaces/IInterestRepository';
import { InterestModel } from '@domain/models/Interest';

export class ListInterestUseCase {
  constructor(private readonly repository: IInterestRepository) {}

  async execute(): Promise<InterestModel[]> {
    return this.repository.findByOrder();
  }
}
