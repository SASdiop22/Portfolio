import { UploadUserPhotoUseCase } from './UploadUserPhotoUseCase';
import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface IUserPhotoStore {
  findById(id: string): Promise<UserModel | null>;
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

function buildUser(photo: string): UserModel {
  const user = new UserModel();
  user.photo = photo;
  return user;
}

describe('UploadUserPhotoUseCase', () => {
  it('updates the user photo with the provided public URL', async () => {
    const existing = buildUser('https://old.supabase.co/photos/old.jpg');
    const updated = buildUser('https://storage.supabase.co/photos/new.jpg');
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    const sut = new UploadUserPhotoUseCase(repository);

    const result = await sut.execute('1', 'https://storage.supabase.co/photos/new.jpg');

    expect(repository.update).toHaveBeenCalledWith('1', {
      photo: 'https://storage.supabase.co/photos/new.jpg',
    });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the user does not exist', async () => {
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const sut = new UploadUserPhotoUseCase(repository);

    await expect(
      sut.execute('missing', 'https://storage.supabase.co/photos/new.jpg'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when update returns null', async () => {
    const existing = buildUser('https://old.supabase.co/photos/old.jpg');
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(null),
    };
    const sut = new UploadUserPhotoUseCase(repository);

    await expect(
      sut.execute('1', 'https://storage.supabase.co/photos/new.jpg'),
    ).rejects.toThrow(NotFoundException);
  });
});