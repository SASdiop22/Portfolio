import { ISkillRepository } from '@domain/interfaces/ISkillRepository';
import { SkillModel } from '@domain/models/Skill';

export class ListSkillByCategoryUseCase {
  constructor(private readonly repository: ISkillRepository) {}

  async execute(category: string): Promise<SkillModel[]> {
    return this.repository.findByCategory(category);
  }
}
