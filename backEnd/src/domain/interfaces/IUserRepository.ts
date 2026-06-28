import { UserModel } from '../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserModel>;
}
