import { UserModel } from '@domain/models';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserModel>;
  
}
