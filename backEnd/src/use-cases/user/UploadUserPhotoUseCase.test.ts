import { UploadUserPhotoUseCase } from './UploadUserPhotoUseCase';
import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';
import * as fs from 'fs';

jest.mock('fs');

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
  it('updates the user photo path and deletes the old file', async () => {
    const existing = buildUser('/uploads/old.jpg');
    const updated = buildUser('/uploads/new.jpg');
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => undefined);
    const sut = new UploadUserPhotoUseCase(repository, '/uploads');

    const result = await sut.execute('1', 'new.jpg');

    expect(repository.update).toHaveBeenCalledWith('1', { photo: '/uploads/new.jpg' });
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the user does not exist', async () => {
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const sut = new UploadUserPhotoUseCase(repository, '/uploads');

    await expect(sut.execute('missing', 'new.jpg')).rejects.toThrow(NotFoundException);
  });

  it('does not throw when deleting the old photo fails', async () => {
    const existing = buildUser('/uploads/old.jpg');
    const updated = buildUser('/uploads/new.jpg');
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {
      throw new Error('disk error');
    });
    const sut = new UploadUserPhotoUseCase(repository, '/uploads');

    const result = await sut.execute('1', 'new.jpg');

    expect(result).toBe(updated);
  });
});
