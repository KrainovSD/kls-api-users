import { v4 } from 'uuid';

import { Settings } from '@database';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DefaultInfo } from './settings.typings';

@Injectable()
export class SettingsDatabase {
  constructor(
    @InjectModel(Settings) private readonly settingsRepo: typeof Settings,
  ) {}

  async create(userId: string, _: DefaultInfo) {
    const settings = await this.settingsRepo.create({
      id: v4(),
      userId,
    });
    return settings;
  }

  async getById(userId: string, _: DefaultInfo) {
    return this.settingsRepo.findOne({
      where: {
        userId,
      },
    });
  }
}
