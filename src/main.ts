// eslint-disable-next-line import/order
import { otelSDK } from './tracing';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { join } from 'path';
import fastifyHelmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { API_VERSION, services } from './const';
import { AppModule } from './app.module';
import {
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
    prefix: `/${API_VERSION.v1}/static`,
  });

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? 'dw3424w',
  });

  const config = new DocumentBuilder()
    .setTitle('Swagger KLS Users')
    .setDescription('Документация по API')
    .setVersion('1.0.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`/docs`, app, document, {
    customSiteTitle: 'Swagger KLS Users',
  });

  const microservice = app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          {
            hostname: RABBIT_HOST ?? 'localhost',
            port: RABBIT_PORT ? Number(RABBIT_PORT) : 5672,
            protocol: RABBIT_PROTOCOL ?? 'amqp',
            username: RABBIT_USER ?? 'guest',
            password: RABBIT_PASSWORD ?? 'guest',
          },
        ],
        noAck: false,
        queue: services.users.queue,
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
