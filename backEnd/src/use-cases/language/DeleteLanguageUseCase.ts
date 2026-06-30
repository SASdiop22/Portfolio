import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ILanguageDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteLanguageUseCase {
  constructor(private readonly repository: ILanguageDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Language not found');
    }
  }
}
