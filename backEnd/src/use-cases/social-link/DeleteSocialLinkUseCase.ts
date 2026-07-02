import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ISocialLinkDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Social link not found');
    }
  }
}
