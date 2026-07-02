import { InterestModel } from '@domain/models/Interest';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IInterestFinder {
  findById(id: string): Promise<InterestModel | null>;
}

export class GetInterestUseCase {
  constructor(private readonly repository: IInterestFinder) {}

  async execute(id: string): Promise<InterestModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Interest not found');
    }

    return entry;
  }
}
