import { ILanguageRepository } from '@domain/interfaces/ILanguageRepository';
import { LanguageModel } from '@domain/models/Language';

export class ListLanguageUseCase {
  constructor(private readonly repository: ILanguageRepository) {}

  async execute(): Promise<LanguageModel[]> {
    return this.repository.findByOrder();
  }
}
