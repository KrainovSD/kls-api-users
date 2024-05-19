import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.model';
import { Settings } from '../settings/settings.model';
import { SettingsModule } from '../settings/settings.module';
import { ClientModule } from '../clients/client.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Settings]),
    SettingsModule,
    ClientModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
