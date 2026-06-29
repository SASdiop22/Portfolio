import { EducationModel } from '@domain/models/Education';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IEducationFinder {
  findById(id: string): Promise<EducationModel | null>;
}

export class GetEducationUseCase {
  constructor(private readonly repository: IEducationFinder) {}

  async execute(id: string): Promise<EducationModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Education not found');
    }

    return entry;
  }
}
