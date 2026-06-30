import { MarkContactMessageAsReadUseCase } from './MarkContactMessageAsReadUseCase';
import { IContactMessageRepository } from '@domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '@domain/models/ContactMessage';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

describe('MarkContactMessageAsReadUseCase', () => {
  it('marks the message as read and returns it', async () => {
    const updated = new ContactMessageModel();
    const repository: IContactMessageRepository = {
      findUnread: jest.fn(),
      markAsRead: jest.fn().mockResolvedValue(updated),
    };
    const sut = new MarkContactMessageAsReadUseCase(repository);

    const result = await sut.execute('1');

    expect(repository.markAsRead).toHaveBeenCalledWith('1');
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the message does not exist', async () => {
    const repository: IContactMessageRepository = {
      findUnread: jest.fn(),
      markAsRead: jest.fn().mockResolvedValue(null),
    };
    const sut = new MarkContactMessageAsReadUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
