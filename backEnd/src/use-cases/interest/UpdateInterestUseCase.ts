import { InterestModel } from '@domain/models/Interest';
import { UpdateInterestDto } from '@infrastructure/dto/interest/UpdateInterestDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IInterestUpdater {
  update(id: string, data: Partial<InterestModel>): Promise<InterestModel | null>;
}

export class UpdateInterestUseCase {
  constructor(private readonly repository: IInterestUpdater) {}

  async execute(id: string, data: UpdateInterestDto): Promise<InterestModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Interest not found');
    }

    return updated;
  }
}
