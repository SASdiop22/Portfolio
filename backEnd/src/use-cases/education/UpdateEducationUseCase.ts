import { EducationModel } from '@domain/models/Education';
import { UpdateEducationDto } from '@infrastructure/dto/education/UpdateEducationDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IEducationUpdater {
  update(id: string, data: Partial<EducationModel>): Promise<EducationModel | null>;
}

export class UpdateEducationUseCase {
  constructor(private readonly repository: IEducationUpdater) {}

  async execute(id: string, data: UpdateEducationDto): Promise<EducationModel> {
    const updated = await this.repository.update(id, data as unknown as Partial<EducationModel>);

    if (!updated) {
      throw new NotFoundException('Education not found');
    }

    return updated;
  }
}
