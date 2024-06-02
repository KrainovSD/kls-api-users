import { LogLevel, Module } from '@nestjs/common';
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
  LOG_FORMAT,
  LOG_LEVEL,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
  REFRESH_TOKEN_SECRET,
  S3_ACCESS_KEY,
  S3_BUCKET,
  S3_ENDPOINT,
  S3_REGION,
  S3_SECRET_KEY,
} from './config';
import { S3Module } from './modules/s3';

@Module({
  imports: [
    LoggerModule.forRoot({
      transportOptions: [
        {
          type: 'console',
          format: LOG_FORMAT as 'logfmt' | 'json',
          level: LOG_LEVEL.toLowerCase() as LogLevel,
        },
      ],
      defaultMeta: {
        service,
      },
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: POSTGRES_HOST,
        port: Number(POSTGRES_PORT),
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
        models: [User, Settings],
        autoLoadModels: true,
      }),
    }),
    JwtModule.forRoot({
      accessTokenSecret: ACCESS_TOKEN_SECRET,
      refreshTokenSecret: REFRESH_TOKEN_SECRET,
      expiresAccessToken: EXPIRES_ACCESS_TOKEN,
      expiresRefreshToken: EXPIRES_REFRESH_TOKEN,
    }),
    S3Module.forRoot({
      region: S3_REGION,
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
      bucket: S3_BUCKET,
      //   requestHandler: {
      //     requestTimeout: 30000,
      //   },
    }),
    SettingsModule,
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
