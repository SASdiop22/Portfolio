import { ExperienceModel } from '@domain/models/Experience';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IExperienceFinder {
  findById(id: string): Promise<ExperienceModel | null>;
}

export class GetExperienceUseCase {
  constructor(private readonly repository: IExperienceFinder) {}

  async execute(id: string): Promise<ExperienceModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Experience not found');
    }

    return entry;
  }
}
