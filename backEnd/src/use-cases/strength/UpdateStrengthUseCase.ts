import { StrengthModel } from '@domain/models/Strength';
import { UpdateStrengthDto } from '@infrastructure/dto/strength/UpdateStrengthDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IStrengthUpdater {
  update(id: string, data: Partial<StrengthModel>): Promise<StrengthModel | null>;
}

export class UpdateStrengthUseCase {
  constructor(private readonly repository: IStrengthUpdater) {}

  async execute(id: string, data: UpdateStrengthDto): Promise<StrengthModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Strength not found');
    }

    return updated;
  }
}
