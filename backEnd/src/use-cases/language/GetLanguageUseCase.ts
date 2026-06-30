import { LanguageModel } from '@domain/models/Language';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ILanguageFinder {
  findById(id: string): Promise<LanguageModel | null>;
}

export class GetLanguageUseCase {
  constructor(private readonly repository: ILanguageFinder) {}

  async execute(id: string): Promise<LanguageModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Language not found');
    }

    return entry;
  }
}
