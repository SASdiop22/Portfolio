import { DeleteContactMessageUseCase } from './DeleteContactMessageUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IContactMessageDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteContactMessageUseCase', () => {
  it('deletes when the message exists', async () => {
    const repository: IContactMessageDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteContactMessageUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the message does not exist', async () => {
    const repository: IContactMessageDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteContactMessageUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
