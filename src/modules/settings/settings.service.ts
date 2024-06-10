import { Injectable, BadRequestException } from '@nestjs/common';
import { utils } from '@krainovsd/utils';

import { ERROR_MESSAGES, RESPONSE_MESSAGES } from '@constants';

import { UpdateSettingsOptions } from './settings.typings';
import { SettingsDatabase } from './settings.database';

@Injectable()
export class SettingsService {
  constructor(readonly settingsDatabase: SettingsDatabase) {}

  async update({ dto, userId, ...rest }: UpdateSettingsOptions) {
    const settings = await this.settingsDatabase.getById(userId, rest);
    if (!settings) throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    utils.common.updateNewValue(
      settings as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );
    await settings.save();
    return RESPONSE_MESSAGES.success;
  }
}
