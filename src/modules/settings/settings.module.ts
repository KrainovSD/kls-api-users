import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Settings, User } from '@database';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsDatabase } from './settings.database';

@Module({
  imports: [SequelizeModule.forFeature([Settings, User])],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsDatabase],
  exports: [SettingsService],
})
export class SettingsModule {}
