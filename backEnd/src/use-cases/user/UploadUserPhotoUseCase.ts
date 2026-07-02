import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IUserPhotoStore {
  findById(id: string): Promise<UserModel | null>;
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

export class UploadUserPhotoUseCase {
  constructor(private readonly repository: IUserPhotoStore) {}

  async execute(userId: string, photoUrl: string): Promise<UserModel> {
    const existing = await this.repository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.repository.update(userId, { photo: photoUrl });
    if (!updated) throw new NotFoundException('User not found');

    return updated;
  }
}