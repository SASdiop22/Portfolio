import { InterestModel } from '@domain/models/Interest';
import { CreateInterestDto } from '@infrastructure/dto/interest/CreateInterestDto';

export interface IInterestCreator {
  create(data: Partial<InterestModel>): Promise<InterestModel>;
}

export class CreateInterestUseCase {
  constructor(private readonly repository: IInterestCreator) {}

  async execute(data: CreateInterestDto): Promise<InterestModel> {
    return this.repository.create(data);
  }
}
