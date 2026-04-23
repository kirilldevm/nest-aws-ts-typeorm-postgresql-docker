import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: number;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 60 * 60),
    },
  }),
);
