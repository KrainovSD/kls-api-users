import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User, Settings } from '@database';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SettingsModule } from '../settings';
import { ClientModule } from '../clients';
import { UsersDatabase } from './users.database';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Settings]),
    SettingsModule,
    ClientModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersDatabase],
  exports: [UsersService],
})
export class UsersModule {}
