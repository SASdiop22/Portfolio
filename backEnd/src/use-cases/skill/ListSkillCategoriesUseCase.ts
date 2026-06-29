import { ISkillRepository } from '@domain/interfaces/ISkillRepository';

export class ListSkillCategoriesUseCase {
  constructor(private readonly repository: ISkillRepository) {}

  async execute(): Promise<string[]> {
    return this.repository.findAllCategories();
  }
}
