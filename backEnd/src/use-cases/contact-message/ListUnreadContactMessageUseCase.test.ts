import { ListUnreadContactMessageUseCase } from './ListUnreadContactMessageUseCase';
import { IContactMessageRepository } from '@domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '@domain/models/ContactMessage';

describe('ListUnreadContactMessageUseCase', () => {
  it('returns only unread messages', async () => {
    const entries = [new ContactMessageModel()];
    const repository: IContactMessageRepository = {
      findUnread: jest.fn().mockResolvedValue(entries),
      markAsRead: jest.fn(),
    };
    const sut = new ListUnreadContactMessageUseCase(repository);

    const result = await sut.execute();

    expect(repository.findUnread).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
