import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@krainovsd/nest-jwt-service';
import { OperationId, UserId } from '@krainovsd/nest-utils';
import { v4 } from 'uuid';

import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';
import { API_VERSION } from '../../const';
import { GetSettingsMessageDto } from './dto/get-settings-message.dto';

@ApiTags('Настройки')
@Controller(`${API_VERSION.v1}/settings`)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard())
  @Put('')
  updateSetting(
    @Body() dto: UpdateSettingsDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.settingsService.updateSettings({ dto, operationId, userId });
  }

  @UseGuards(AuthGuard())
  @Get('')
  get(@UserId() userId: string, @OperationId() operationId: string) {
    return this.settingsService.getSettingsByUserId({ userId, operationId });
  }

  @MessagePattern('user_settings')
  checkAuth(@Payload() dto: GetSettingsMessageDto) {
    return this.settingsService.getSettingsByUserId({
      operationId: v4(),
      userId: dto.userId,
    });
  }
}
