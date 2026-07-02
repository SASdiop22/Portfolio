import { NewsModel } from '@domain/models/News';
import { CreateNewsDto } from '@infrastructure/dto/news/CreateNewsDto';

export interface INewsCreator {
  create(data: Partial<NewsModel>): Promise<NewsModel>;
}

export class CreateNewsUseCase {
  constructor(private readonly repository: INewsCreator) {}

  async execute(data: CreateNewsDto): Promise<NewsModel> {
    return this.repository.create(data as unknown as Partial<NewsModel>);
  }
}
