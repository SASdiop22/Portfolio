import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IEducationDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteEducationUseCase {
  constructor(private readonly repository: IEducationDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Education not found');
    }
  }
}
