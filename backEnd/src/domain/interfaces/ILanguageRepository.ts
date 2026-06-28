import { LanguageModel } from '../models/Language';

export interface ILanguageRepository {
  findByOrder(): Promise<LanguageModel[]>;
}
