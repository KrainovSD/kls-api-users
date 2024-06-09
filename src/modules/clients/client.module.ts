import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { SERVICES } from '@constants';

import { ClientService } from './client.service';
import { getClientsOptions } from './client.options';

@Module({
  imports: [
    ClientsModule.register(
      getClientsOptions(SERVICES.statistics.alias, SERVICES.statistics.queue),
    ),
    ClientsModule.register(
      getClientsOptions(SERVICES.words.alias, SERVICES.words.queue),
    ),
  ],
  controllers: [],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
