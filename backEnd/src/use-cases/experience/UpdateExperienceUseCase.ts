import { ExperienceModel } from '@domain/models/Experience';
import { UpdateExperienceDto } from '@infrastructure/dto/experience/UpdateExperienceDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IExperienceUpdater {
  update(id: string, data: Partial<ExperienceModel>): Promise<ExperienceModel | null>;
}

export class UpdateExperienceUseCase {
  constructor(private readonly repository: IExperienceUpdater) {}

  async execute(id: string, data: UpdateExperienceDto): Promise<ExperienceModel> {
    const updated = await this.repository.update(id, data as unknown as Partial<ExperienceModel>);

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return updated;
  }
}
