import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IExperienceDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteExperienceUseCase {
  constructor(private readonly repository: IExperienceDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Experience not found');
    }
  }
}
