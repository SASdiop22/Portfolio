import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { UnauthorizedException } from '@shared/exceptions/UnauthorizedException';
import { envConfig } from '@config/env.config';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: { id: string; email: string; firstName: string; lastName: string };
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, envConfig.jwt.secret, {
      expiresIn: envConfig.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    };
  }
}
