import { UserModel } from '@domain/models/User';
import { UpdateUserProfileDto } from '@infrastructure/dto/user/UpdateUserProfileDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IUserUpdater {
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly repository: IUserUpdater) {}

  async execute(userId: string, data: UpdateUserProfileDto): Promise<UserModel> {
    const updated = await this.repository.update(userId, data as unknown as Partial<UserModel>);

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}
