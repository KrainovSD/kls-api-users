// eslint-disable-next-line import/order
import { otelSDK } from './tracing';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

import { ROUTE_PREFIX, SERVICES } from '@constants';

import { AppModule } from './app.module';
import {
  COOKIE_SECRET,
  PORT,
  RABBIT_HOST,
  RABBIT_PASSWORD,
  RABBIT_PORT,
  RABBIT_PROTOCOL,
  RABBIT_USER,
} from './config';

async function start() {
  await otelSDK.start();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`],
      },
    },
  });

  app.register(multipart, {
    throwFileSizeLimit: true,
  });

  app.useStaticAssets({
    root: join(__dirname, '../../upload'),
    prefix: `/${ROUTE_PREFIX.v1}/static`,
  });

  app.register(fastifyCookie, {
    secret: COOKIE_SECRET,
  });

  const config = new DocumentBuilder()
    .setTitle('Swagger KLS Users')
    .setDescription('Документация по API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`/docs`, app, document, {
    customSiteTitle: 'Swagger KLS Users',
  });

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          {
            hostname: RABBIT_HOST,
            port: RABBIT_PORT,
            protocol: RABBIT_PROTOCOL,
            username: RABBIT_USER,
            password: RABBIT_PASSWORD,
          },
        ],
        noAck: false,
        queue: SERVICES.users.queue,
        queueOptions: {
          durable: false,
        },
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  await app.listen(PORT);
}
start();
