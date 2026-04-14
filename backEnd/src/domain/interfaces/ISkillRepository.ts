import { Skill } from '../models/Skill';
import { IBaseRepository } from './IBaseRepository';

export interface ISkillRepository extends IBaseRepository<Skill> {
  findByCategory(category: string): Promise<Skill[]>;
  findAllCategories(): Promise<string[]>;
  findByOrder(): Promise<Skill[]>;
}
