import { CreateContactMessageUseCase } from './CreateContactMessageUseCase';
import { ContactMessageModel } from '@domain/models/ContactMessage';

interface IContactMessageCreator {
  create(data: Partial<ContactMessageModel>): Promise<ContactMessageModel>;
}

describe('CreateContactMessageUseCase', () => {
  it('creates and returns the new message', async () => {
    const created = new ContactMessageModel();
    const repository: IContactMessageCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateContactMessageUseCase(repository);
    const input = {
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Hello',
      message: 'Hi there',
    };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
