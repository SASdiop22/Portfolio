import { SkillModel } from '@domain/models/Skill';
import { CreateSkillDto } from '@infrastructure/dto/skill/CreateSkillDto';

export interface ISkillCreator {
  create(data: Partial<SkillModel>): Promise<SkillModel>;
}

export class CreateSkillUseCase {
  constructor(private readonly repository: ISkillCreator) {}

  async execute(data: CreateSkillDto): Promise<SkillModel> {
    return this.repository.create(data);
  }
}
