import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import {
  RABBIT_HOST,
  RABBIT_PASSWORD,
  RABBIT_PORT,
  RABBIT_PROTOCOL,
  RABBIT_USER,
} from '../../config';

export function getClientsOptions(
  name: string,
  queue: string | undefined,
): ClientsModuleOptions {
  return [
    {
      name,
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
        queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  ];
}
