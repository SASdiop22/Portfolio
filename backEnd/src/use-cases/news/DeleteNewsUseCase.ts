import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface INewsDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteNewsUseCase {
  constructor(private readonly repository: INewsDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('News not found');
    }
  }
}
