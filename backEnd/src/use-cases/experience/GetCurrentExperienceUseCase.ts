import { IExperienceRepository } from '@domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '@domain/models/Experience';

export class GetCurrentExperienceUseCase {
  constructor(private readonly repository: IExperienceRepository) {}

  async execute(): Promise<ExperienceModel[]> {
    return this.repository.findCurrent();
  }
}
