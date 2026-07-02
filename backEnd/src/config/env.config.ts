import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  // Application
  nodeEnv: string;
  port: number;
  apiPrefix: string;

  // Database
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
  };

  admin: {
    email: string;
    password: string;
  };

  // CORS
  frontendUrl: string;

  // Upload
  upload: {
    maxFileSize: number;
    uploadPath: string;
  };
}

class EnvConfigService {
  private config: EnvConfig;

  constructor() {
    this.config = this.validateConfig();
  }

  private validateConfig(): EnvConfig {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT || '5000', 10),
      apiPrefix: process.env.API_PREFIX || '/api/v1',

      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'portfolio_db',
      },

      jwt: {
        secret: this.getRequired('JWT_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },

      admin: {
        email: this.getRequired('ADMIN_EMAIL'),
        password: this.getRequired('ADMIN_PASSWORD'),
      },

      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

      upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
        uploadPath: process.env.UPLOAD_PATH || './uploads',
      },
    };
  }

  private getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`La variable d'environnement ${key} est requise mais non définie`);
    }
    return value;
  }

  public get(): EnvConfig {
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}

export const envConfig = new EnvConfigService().get();
export const isDevelopment = new EnvConfigService().isDevelopment();
export const isProduction = new EnvConfigService().isProduction();
