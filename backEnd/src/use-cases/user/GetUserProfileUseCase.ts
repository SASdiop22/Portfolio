import { UserModel } from '@domain/models/User';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface IUserLister {
  findAll(): Promise<UserModel[]>;
}

export class GetUserProfileUseCase {
  constructor(private readonly repository: IUserLister) {}

  async execute(): Promise<UserModel> {
    const users = await this.repository.findAll();

    if (users.length === 0) {
      throw new NotFoundException('No profile has been set up yet');
    }

    return users[0];
  }
}
