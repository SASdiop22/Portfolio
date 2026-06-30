import { ListRecentNewsUseCase } from './ListRecentNewsUseCase';
import { INewsRepository } from '@domain/interfaces/INewsRepository';
import { NewsModel } from '@domain/models/News';

describe('ListRecentNewsUseCase', () => {
  it('returns the most recent news up to the given limit', async () => {
    const entries = [new NewsModel()];
    const repository: INewsRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn(),
      findRecent: jest.fn().mockResolvedValue(entries),
    };
    const sut = new ListRecentNewsUseCase(repository);

    const result = await sut.execute(5);

    expect(repository.findRecent).toHaveBeenCalledWith(5);
    expect(result).toBe(entries);
  });
});
