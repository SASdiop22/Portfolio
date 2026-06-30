import { StrengthModel } from '@domain/models/Strength';
import { CreateStrengthDto } from '@infrastructure/dto/strength/CreateStrengthDto';

export interface IStrengthCreator {
  create(data: Partial<StrengthModel>): Promise<StrengthModel>;
}

export class CreateStrengthUseCase {
  constructor(private readonly repository: IStrengthCreator) {}

  async execute(data: CreateStrengthDto): Promise<StrengthModel> {
    return this.repository.create(data);
  }
}
