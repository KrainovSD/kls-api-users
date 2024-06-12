import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@krainovsd/nest-jwt-service';
import { OperationId, UserId } from '@krainovsd/nest-utils';
import { v4 } from 'uuid';

import { RESPONSE_MESSAGES, ROUTE_PREFIX } from '@constants';
import { Settings } from '@database';

import { SettingsService } from './settings.service';
import { GetSettingsMessageDto, UpdateSettingsDto } from './dto';

@ApiTags('Настройки')
@Controller(`${ROUTE_PREFIX.v1}/settings`)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: RESPONSE_MESSAGES.success,
    },
  })
  @UseGuards(AuthGuard())
  @Put('')
  updateSetting(
    @Body() dto: UpdateSettingsDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.settingsService.update({ dto, operationId, userId });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: Settings })
  @UseGuards(AuthGuard())
  @Get('')
  get(@UserId() userId: string, @OperationId() operationId: string) {
    return this.settingsService.settingsDatabase.getById(userId, {
      operationId,
    });
  }

  @MessagePattern('user_settings')
  checkAuth(@Payload() dto: GetSettingsMessageDto) {
    return this.settingsService.settingsDatabase.getById(dto.userId, {
      operationId: v4(),
    });
  }
}
