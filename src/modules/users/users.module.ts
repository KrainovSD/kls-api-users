import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User, Settings } from '@database';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SettingsModule } from '../settings';
import { ClientModule } from '../clients';

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
