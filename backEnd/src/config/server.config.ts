import { Application } from 'express';
import cors from 'cors';
import express from 'express';
import { envConfig } from './env.config';

export const configureServer = (app: Application): void => {
  // CORS
  app.use(
    cors({
      origin: envConfig.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files
  app.use('/uploads', express.static(envConfig.upload.uploadPath));

  // Logs en développement
  if (envConfig.nodeEnv === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }
};
