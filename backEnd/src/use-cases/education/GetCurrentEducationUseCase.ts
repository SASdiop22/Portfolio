import { IEducationRepository } from '@domain/interfaces/IEducationRepository';
import { EducationModel } from '@domain/models/Education';

export class GetCurrentEducationUseCase {
  constructor(private readonly repository: IEducationRepository) {}

  async execute(): Promise<EducationModel[]> {
    return this.repository.findCurrent();
  }
}
