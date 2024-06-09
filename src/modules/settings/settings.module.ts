import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Settings, User } from '@database';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [SequelizeModule.forFeature([Settings, User])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
