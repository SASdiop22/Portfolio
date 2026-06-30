import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IInterestDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteInterestUseCase {
  constructor(private readonly repository: IInterestDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Interest not found');
    }
  }
}
