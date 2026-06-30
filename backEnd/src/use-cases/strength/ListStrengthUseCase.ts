import { IStrengthRepository } from '@domain/interfaces/IStrengthRepository';
import { StrengthModel } from '@domain/models/Strength';

export class ListStrengthUseCase {
  constructor(private readonly repository: IStrengthRepository) {}

  async execute(): Promise<StrengthModel[]> {
    return this.repository.findByOrder();
  }
}
