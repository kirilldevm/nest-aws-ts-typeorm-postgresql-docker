import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  messagePrefix: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    port: Number(process.env.PORT ?? 3000),
    messagePrefix: process.env.MESSAGE_PREFIX ?? 'Hello',
  }),
);
