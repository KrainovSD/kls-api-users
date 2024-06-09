import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SettingsModule, Settings, ClientModule } from '@modules';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.model';

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
