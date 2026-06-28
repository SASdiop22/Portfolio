import { LanguageModel } from '@domain/models';

export interface ILanguageRepository {
  findByOrder(): Promise<LanguageModel[]>;
}
