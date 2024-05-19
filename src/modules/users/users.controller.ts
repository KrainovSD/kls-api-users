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
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@krainovsd/nest-jwt-service';
import { IncomingFileName, OperationId, UserId } from '@krainovsd/nest-utils';

import { UsersService } from './users.service';
import {} from './dto/change-nick-name.dto';
import { API_VERSION } from '../../const';
import {
  ChangeNickNameDto,
  ChangeEmailDto,
  CallChangePassDto,
  ChangePassDto,
  DeleteUsersDto,
  GetUserDto,
} from './dto';
import {
  MAX_SIZE_AVATAR,
  MAX_SIZE_WALLPAPER,
  MIME_TYPE_AVATAR,
  MIME_TYPE_WALLPAPER,
  UPLOAD_PATH_AVATAR,
  UPLOAD_PATH_WALLPAPER,
} from './users.constants';
import { UploadInterceptor } from '../../utils';

@ApiTags('Пользователи')
@Controller(`${API_VERSION.v1}/user`)
export class UsersController {
  constructor(private readonly userServise: UsersService) {}

  @Get('/:id')
  getUser(@Param() getUserDto: GetUserDto, @OperationId() operationId: string) {
    return this.userServise.getUserById({ id: getUserDto.id, operationId });
  }

  @UseGuards(AuthGuard())
  @Get('')
  getYourself(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.getUserById({
      id: userId,
      operationId,
      privateFields: true,
    });
  }

  @UseGuards(AuthGuard())
  @Get('/all')
  getAllUser(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.getAllUser({ userId, operationId });
  }

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
  @Put('/pass')
  changePass(
    @Body() dto: ChangePassDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.changePass({ dto, userId, operationId });
  }

  @UseGuards(AuthGuard())
  @Post('/email')
  callChangeEmail(
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.callChangeEmail({ userId, operationId });
  }

  @UseGuards(AuthGuard())
  @Put('/email')
  changeEmail(
    @Body() dto: ChangeEmailDto,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.changeEmail({ dto, userId, operationId });
  }

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
  @UseGuards(AuthGuard())
  @UseInterceptors(
    UploadInterceptor({
      fieldName: 'avatar',
      limits: MAX_SIZE_AVATAR,
      mimeTypes: MIME_TYPE_AVATAR,
      pathToSave: UPLOAD_PATH_AVATAR,
    }),
  )
  @Put('/avatar')
  updateAvatar(
    @IncomingFileName() fileName: string,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.updateAvatar({ fileName, operationId, userId });
  }

  @UseGuards(AuthGuard())
  @Delete('/wallpaper')
  clearWallpaper(@UserId() userId: string, @OperationId() operationId: string) {
    return this.userServise.clearWallpaper({ userId, operationId });
  }

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
  @UseGuards(AuthGuard())
  @Put('/wallpaper')
  @UseInterceptors(
    UploadInterceptor({
      fieldName: 'wallpaper',
      limits: MAX_SIZE_WALLPAPER,
      mimeTypes: MIME_TYPE_WALLPAPER,
      pathToSave: UPLOAD_PATH_WALLPAPER,
    }),
  )
  updateWallpaper(
    @IncomingFileName() fileName: string,
    @UserId() userId: string,
    @OperationId() operationId: string,
  ) {
    return this.userServise.updateWallpaper({ fileName, operationId, userId });
  }

  @UseGuards(AuthGuard({ roles: 'admin' }))
  @Post('/delete')
  deleteUsers(@Body() dto: DeleteUsersDto, @OperationId() operationId: string) {
    return this.userServise.deleteUsers({ dto, operationId });
  }
}
