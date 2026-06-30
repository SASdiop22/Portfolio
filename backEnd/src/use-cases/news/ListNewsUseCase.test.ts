import { ListNewsUseCase } from './ListNewsUseCase';
import { INewsRepository } from '@domain/interfaces/INewsRepository';
import { NewsModel } from '@domain/models/News';

describe('ListNewsUseCase', () => {
  it('returns every news entry ordered by the repository', async () => {
    const entries = [new NewsModel(), new NewsModel()];
    const repository: INewsRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findByCategory: jest.fn(),
      findRecent: jest.fn(),
    };
    const sut = new ListNewsUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
