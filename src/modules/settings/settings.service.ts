import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { utils } from '@krainovsd/utils';
import { v4 } from 'uuid';

import { ERROR_MESSAGES, RESPONSE_MESSAGES } from '@constants';
import { Settings } from '@database';

import {
  UpdateSettingsOptions,
  GetSettingsByUserIdOptions,
} from './settings.typings';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings) private readonly settingRepo: typeof Settings,
  ) {}

  async updateSettings({ dto, userId, ...rest }: UpdateSettingsOptions) {
    const settings = await this.getSettingsByUserId({ userId, ...rest });
    if (!settings) throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    utils.common.updateNewValue(
      settings as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );
    await settings.save();
    return RESPONSE_MESSAGES.success;
  }

  async createSettings(userId: string) {
    const settings = await this.settingRepo.create({
      id: v4(),
      userId,
    });
    return settings;
  }

  async getSettingsByUserId({ userId }: GetSettingsByUserIdOptions) {
    return this.settingRepo.findOne({
      where: {
        userId,
      },
    });
  }
}
