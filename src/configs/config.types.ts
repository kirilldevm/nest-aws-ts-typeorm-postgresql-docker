import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';
import { AppConfig } from './app.config';
import { AuthConfig } from './auth.config';

export interface ConfigTypes {
  app: AppConfig;
  database: TypeOrmModuleOptions;
  auth: AuthConfig;
}

export const appConfigSchema = Joi.object({
  PORT: Joi.number().positive(),
  MESSAGE_PREFIX: Joi.string(),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().positive().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  DB_SYNC: Joi.number().valid(0, 1).required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
