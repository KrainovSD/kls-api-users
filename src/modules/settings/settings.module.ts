import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from '@modules';

import { SettingsController } from './settings.controller';
import { Settings } from './settings.model';
import { SettingsService } from './settings.service';
// import { User } from '../users';

@Module({
  imports: [SequelizeModule.forFeature([Settings, User])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
