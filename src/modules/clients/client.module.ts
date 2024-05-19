import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { ClientService } from './client.service';
import { services } from '../../const';
import { getClientsOptions } from './client.options';

@Module({
  imports: [
    ClientsModule.register(
      getClientsOptions(services.statistics.alias, services.statistics.queue),
    ),
    ClientsModule.register(
      getClientsOptions(services.words.alias, services.words.queue),
    ),
  ],
  controllers: [],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
