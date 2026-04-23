import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './configs/app.config';
import { authConfig } from './configs/auth.config';
import { appConfigSchema } from './configs/config.types';
import { dbConfig } from './configs/db.config';
import { TypedConfigService } from './configs/typed-config.service';
import { TaskLabel } from './tasks/task-label.entity';
import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) => ({
        ...((configService.get('database') as TypeOrmModuleOptions) ?? {}),
        entities: [Task, TaskLabel, User],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, authConfig],
      validationSchema: appConfigSchema,
      validationOptions: {
        abortEarly: true,
        // allowUnknown: false,
      },
    }),
    TasksModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
})
export class AppModule {}
