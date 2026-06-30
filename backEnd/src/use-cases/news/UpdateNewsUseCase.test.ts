import { UpdateNewsUseCase } from './UpdateNewsUseCase';
import { NewsModel } from '@domain/models/News';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface INewsUpdater {
  update(id: string, data: Partial<NewsModel>): Promise<NewsModel | null>;
}

describe('UpdateNewsUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new NewsModel();
    const repository: INewsUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateNewsUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: INewsUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateNewsUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
