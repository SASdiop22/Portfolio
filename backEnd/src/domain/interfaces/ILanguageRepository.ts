import { LanguageModel } from '@domain/models/Language';

export interface ILanguageRepository {
  findByOrder(): Promise<LanguageModel[]>;
}
