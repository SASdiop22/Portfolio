import { StrengthModel } from '@domain/models/Strength';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IStrengthFinder {
  findById(id: string): Promise<StrengthModel | null>;
}

export class GetStrengthUseCase {
  constructor(private readonly repository: IStrengthFinder) {}

  async execute(id: string): Promise<StrengthModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Strength not found');
    }

    return entry;
  }
}
