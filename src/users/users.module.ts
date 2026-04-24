import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthConfig } from 'src/configs/auth.config';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PasswordService } from './password/password.service';
import { RolesGuard } from './roles.guard';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<AuthConfig>('auth');
        return {
          secret: config?.jwt.secret,
          signOptions: {
            expiresIn:
              typeof config?.jwt.expiresIn === 'number' ||
              typeof config?.jwt.expiresIn === 'undefined'
                ? (config?.jwt.expiresIn ?? 60 * 60)
                : undefined,
          },
        };
      },
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    PasswordService,
    AuthService,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class UsersModule {}
