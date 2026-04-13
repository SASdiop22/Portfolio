import { Language } from '../models/Language';
import { IBaseRepository } from './IBaseRepository';

export interface ILanguageRepository extends IBaseRepository<Language> {
  findByOrder(): Promise<Language[]>;
}
