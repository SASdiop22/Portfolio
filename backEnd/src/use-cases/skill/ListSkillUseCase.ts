import { ISkillRepository } from '@domain/interfaces/ISkillRepository';
import { SkillModel } from '@domain/models/Skill';

export class ListSkillUseCase {
  constructor(private readonly repository: ISkillRepository) {}

  async execute(): Promise<SkillModel[]> {
    return this.repository.findByOrder();
  }
}
