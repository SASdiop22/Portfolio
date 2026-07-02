import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ISkillDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteSkillUseCase {
  constructor(private readonly repository: ISkillDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Skill not found');
    }
  }
}
