import { UserModel } from '@domain/models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserModel | null>;
}
