import { ClientsModuleOptions, Transport } from '@nestjs/microservices';

import {
  RABBIT_HOST,
  RABBIT_PASSWORD,
  RABBIT_PORT,
  RABBIT_PROTOCOL,
  RABBIT_USER,
} from '@config';

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
            hostname: RABBIT_HOST,
            port: RABBIT_PORT,
            protocol: RABBIT_PROTOCOL,
            username: RABBIT_USER,
            password: RABBIT_PASSWORD,
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
