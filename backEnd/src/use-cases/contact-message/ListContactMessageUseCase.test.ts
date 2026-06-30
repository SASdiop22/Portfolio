import { ListContactMessageUseCase } from './ListContactMessageUseCase';
import { ContactMessageModel } from '@domain/models/ContactMessage';

interface IContactMessageLister {
  findAll(): Promise<ContactMessageModel[]>;
}

describe('ListContactMessageUseCase', () => {
  it('returns every message', async () => {
    const entries = [new ContactMessageModel(), new ContactMessageModel()];
    const repository: IContactMessageLister = { findAll: jest.fn().mockResolvedValue(entries) };
    const sut = new ListContactMessageUseCase(repository);

    const result = await sut.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
