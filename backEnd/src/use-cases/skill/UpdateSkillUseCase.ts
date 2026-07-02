import { SkillModel } from '@domain/models/Skill';
import { UpdateSkillDto } from '@infrastructure/dto/skill/UpdateSkillDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ISkillUpdater {
  update(id: string, data: Partial<SkillModel>): Promise<SkillModel | null>;
}

export class UpdateSkillUseCase {
  constructor(private readonly repository: ISkillUpdater) {}

  async execute(id: string, data: UpdateSkillDto): Promise<SkillModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Skill not found');
    }

    return updated;
  }
}
