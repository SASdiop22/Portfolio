import { LanguageModel } from '@domain/models/Language';
import { UpdateLanguageDto } from '@infrastructure/dto/language/UpdateLanguageDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ILanguageUpdater {
  update(id: string, data: Partial<LanguageModel>): Promise<LanguageModel | null>;
}

export class UpdateLanguageUseCase {
  constructor(private readonly repository: ILanguageUpdater) {}

  async execute(id: string, data: UpdateLanguageDto): Promise<LanguageModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Language not found');
    }

    return updated;
  }
}
