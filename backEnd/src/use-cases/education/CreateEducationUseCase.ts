import { EducationModel } from '@domain/models/Education';
import { CreateEducationDto } from '@infrastructure/dto/education/CreateEducationDto';

export interface IEducationCreator {
  create(data: Partial<EducationModel>): Promise<EducationModel>;
}

export class CreateEducationUseCase {
  constructor(private readonly repository: IEducationCreator) {}

  async execute(data: CreateEducationDto): Promise<EducationModel> {
    return this.repository.create(data as unknown as Partial<EducationModel>);
  }
}
