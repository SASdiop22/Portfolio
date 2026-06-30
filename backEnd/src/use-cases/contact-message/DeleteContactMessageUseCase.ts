import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IContactMessageDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteContactMessageUseCase {
  constructor(private readonly repository: IContactMessageDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Contact message not found');
    }
  }
}
