import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@krainovsd/nest-jwt-service';
import { OperationId, UserId } from '@krainovsd/nest-utils';
import {
  IncomingFile,
  UploadInterceptor,
} from '@krainovsd/nest-uploading-service';

import {
  MAX_SIZE_AVATAR,
  MAX_SIZE_WALLPAPER,
  MIME_TYPE_AVATAR,
  MIME_TYPE_WALLPAPER,
  RESPONSE_MESSAGES,
  ROUTE_PREFIX,
} from '@constants';
import { User } from '@database';

import { UsersService } from './users.service';
import {
  ChangeNickNameDto,
  ChangeEmailDto,
  CallChangePassDto,
  ChangePassDto,
  DeleteUsersDto,
  GetUserDto,
} from './dto';

@ApiTags('Пользователи')
@Controller(`${ROUTE_PREFIX.v1}/users`)
export class UsersController {
  constructor(private readonly userServise: UsersService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @UseGuards(AuthGuard())
  @Get('/:id')
  getUser(@Param() getUserDto: GetUserDto, @OperationId() operationId: string) {
    return this.userServise.usersDatabase.getById({
      id: getUserDto.id,
      operationId,
    });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @UseGuards(AuthGuard())
  @Get('')
  getYourself(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.usersDatabase.getById({
      id: userId,
      operationId,
      privateFields: true,
    });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: User, isArray: true })
  @UseGuards(AuthGuard())
  @Get('/all')
  getAllUser(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.usersDatabase.getAllExceptOne(userId, {
      operationId,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ schema: { example: RESPONSE_MESSAGES.sendEmail } })
  @UseGuards(AuthGuard())
  @Post('/pass')
  callChangePass(
    @Body() dto: CallChangePassDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.callChangePass({
      email: dto.email,
      userId,
      operationId,
    });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard())
  @Put('/pass')
  changePass(
    @Body() dto: ChangePassDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.changePass({ dto, userId, operationId });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ schema: { example: RESPONSE_MESSAGES.sendEmail } })
  @UseGuards(AuthGuard())
  @Post('/email')
  callChangeEmail(
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.callChangeEmail({ userId, operationId });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.sendNewEmail } })
  @UseGuards(AuthGuard())
  @Put('/email')
  changeEmail(
    @Body() dto: ChangeEmailDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.changeEmail({ dto, userId, operationId });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard({ subscription: true }))
  @Put('/nickName')
  changeNickName(
    @Body() dto: ChangeNickNameDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.changeNickName({
      nickName: dto.nickName,
      userId,
      operationId,
    });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard())
  @Delete('/avatar')
  clearAvatar(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.clearAvatar({ userId, operationId });
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard())
  @UseInterceptors(
    UploadInterceptor({
      fieldName: 'avatar',
      limits: MAX_SIZE_AVATAR,
      mimeTypes: MIME_TYPE_AVATAR,
    }),
  )
  @Put('/avatar')
  updateAvatar(
    @IncomingFile() incomingFile: IncomingFile,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.updateAvatar({ incomingFile, operationId, userId });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard())
  @Delete('/wallpaper')
  clearWallpaper(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.clearWallpaper({ userId, operationId });
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        wallpaper: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard())
  @Put('/wallpaper')
  @UseInterceptors(
    UploadInterceptor({
      fieldName: 'wallpaper',
      limits: MAX_SIZE_WALLPAPER,
      mimeTypes: MIME_TYPE_WALLPAPER,
    }),
  )
  updateWallpaper(
    @IncomingFile() incomingFile: IncomingFile,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.updateWallpaper({
      incomingFile,
      operationId,
      userId,
    });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard({ roles: 'admin' }))
  @Delete('/delete')
  deleteUsers(@Body() dto: DeleteUsersDto, @OperationId() operationId: string) {
    return this.userServise.deleteAll({ dto, operationId });
  }
}
