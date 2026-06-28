import 'reflect-metadata';
import { envConfig } from './env.config';

export const databaseConfig = {
  type: 'postgres' as const,
  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.database,
  synchronize: envConfig.nodeEnv === 'development',
  logging: envConfig.nodeEnv === 'development',
};
