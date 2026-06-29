import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IProjectDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteProjectUseCase {
  constructor(private readonly repository: IProjectDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Project not found');
    }
  }
}
