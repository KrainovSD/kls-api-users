import { LogLevel, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  LoggerFilter,
  LoggerInterceptor,
  LoggerModule,
} from '@krainovsd/nest-logger-service';
import { TrimPipe, ValidationPipe } from '@krainovsd/nest-utils';
import { JwtModule } from '@krainovsd/nest-jwt-service';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { MailerModule } from './modules/mailer';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/users/users.model';
import { Settings } from './modules/settings/settings.model';
import { service } from './const';
import {
  ACCESS_TOKEN_SECRET,
  EXPIRES_ACCESS_TOKEN,
  EXPIRES_REFRESH_TOKEN,
  LOG_LEVEL,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
  REFRESH_TOKEN_SECRET,
} from './config';

@Module({
  imports: [
    LoggerModule.forRoot({
      transportOptions: [
        { type: 'console', format: 'logfmt', level: LOG_LEVEL as LogLevel },
      ],
      defaultMeta: {
        service,
      },
    }),
    SettingsModule,
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: POSTGRES_HOST,
      port: Number(POSTGRES_PORT),
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      models: [User, Settings],
      autoLoadModels: true,
    }),
    JwtModule.forRoot({
      accessTokenSecret: ACCESS_TOKEN_SECRET,
      refreshTokenSecret: REFRESH_TOKEN_SECRET,
      expiresAccessToken: EXPIRES_ACCESS_TOKEN,
      expiresRefreshToken: EXPIRES_REFRESH_TOKEN,
    }),
    UsersModule,
    AuthModule,
    MailerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LoggerFilter,
    },
    {
      provide: APP_PIPE,
      useClass: TrimPipe,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
