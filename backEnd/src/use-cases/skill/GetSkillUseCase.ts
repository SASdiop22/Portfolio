import { SkillModel } from '@domain/models/Skill';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ISkillFinder {
  findById(id: string): Promise<SkillModel | null>;
}

export class GetSkillUseCase {
  constructor(private readonly repository: ISkillFinder) {}

  async execute(id: string): Promise<SkillModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Skill not found');
    }

    return entry;
  }
}
