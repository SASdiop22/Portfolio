import { ExperienceModel } from '@domain/models/Experience';
import { CreateExperienceDto } from '@infrastructure/dto/experience/CreateExperienceDto';

export interface IExperienceCreator {
  create(data: Partial<ExperienceModel>): Promise<ExperienceModel>;
}

export class CreateExperienceUseCase {
  constructor(private readonly repository: IExperienceCreator) {}

  async execute(data: CreateExperienceDto): Promise<ExperienceModel> {
    return this.repository.create(data as unknown as Partial<ExperienceModel>);
  }
}
