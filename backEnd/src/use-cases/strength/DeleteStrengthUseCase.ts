import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IStrengthDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteStrengthUseCase {
  constructor(private readonly repository: IStrengthDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Strength not found');
    }
  }
}
