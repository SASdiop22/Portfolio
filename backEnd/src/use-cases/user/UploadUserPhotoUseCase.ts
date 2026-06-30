import * as fs from 'fs';
import * as path from 'path';
import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IUserPhotoStore {
  findById(id: string): Promise<UserModel | null>;
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

export class UploadUserPhotoUseCase {
  constructor(
    private readonly repository: IUserPhotoStore,
    private readonly uploadPath: string,
  ) {}

  async execute(userId: string, filename: string): Promise<UserModel> {
    const existing = await this.repository.findById(userId);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const newPhotoPath = `/uploads/${filename}`;
    const updated = await this.repository.update(userId, { photo: newPhotoPath });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    if (existing.photo) {
      const oldFilePath = path.join(this.uploadPath, path.basename(existing.photo));
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch {
        // Best-effort cleanup — a failure to delete the old file must not fail the request.
      }
    }

    return updated;
  }
}
