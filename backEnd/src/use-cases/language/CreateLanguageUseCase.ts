import { LanguageModel } from '@domain/models/Language';
import { CreateLanguageDto } from '@infrastructure/dto/language/CreateLanguageDto';

export interface ILanguageCreator {
  create(data: Partial<LanguageModel>): Promise<LanguageModel>;
}

export class CreateLanguageUseCase {
  constructor(private readonly repository: ILanguageCreator) {}

  async execute(data: CreateLanguageDto): Promise<LanguageModel> {
    return this.repository.create(data);
  }
}
