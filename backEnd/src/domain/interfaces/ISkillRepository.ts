import { SkillModel } from '@domain/models';

export interface ISkillRepository {
  findByCategory(category: string): Promise<SkillModel[]>;
  findAllCategories(): Promise<string[]>;
  findByOrder(): Promise<SkillModel[]>;
}
