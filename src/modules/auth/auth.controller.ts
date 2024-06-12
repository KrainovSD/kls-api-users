import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OperationId, UserId } from '@krainovsd/nest-utils';
import { AuthGuard } from '@krainovsd/nest-jwt-service';
import { FastifyReply, FastifyRequest } from 'fastify';

import { EXPIRES_COOKIES, RESPONSE_MESSAGES, ROUTE_PREFIX } from '@constants';

import { AuthService } from './auth.service';
import { ConfirmDto, LoginDto } from './dto';
import { CreateUserDto } from '../users';

type CookieOptions = {
  sameSite: 'strict';
  secure: boolean;
  httpOnly: boolean;
  maxAge: number;
};

@ApiTags('Авторизация')
@Controller(`${ROUTE_PREFIX.v1}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions(type: 'create' | 'delete'): CookieOptions {
    return {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      maxAge: type === 'create' ? EXPIRES_COOKIES : 0,
    };
  }

  @ApiCreatedResponse({ schema: { example: RESPONSE_MESSAGES.sendEmail } })
  @Post('/register')
  register(@Body() userDto: CreateUserDto, @OperationId() operationId: string) {
    return this.authService.register({ userDto, operationId });
  }

  @ApiCreatedResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @Post('/confirm')
  confirm(@Body() confirmDto: ConfirmDto, @OperationId() operationId: string) {
    return this.authService.confirm({ confirmDto, operationId });
  }

  @ApiCreatedResponse({
    schema: { example: { access: 'token', refresh: 'token' } },
  })
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @OperationId() operationId: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const tokens = await this.authService.login({
      loginDto,
      operationId,
    });
    response.setCookie(
      'token',
      tokens.refresh,
      this.getCookieOptions('create'),
    );
    return { token: tokens.access };
  }

  @ApiOkResponse({
    schema: { example: { token: 'token' } },
  })
  @Put('/token')
  token(@Req() request: FastifyRequest, @OperationId() operationId: string) {
    return this.authService.token({
      refreshToken: request.cookies.token,
      operationId,
    });
  }

  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: RESPONSE_MESSAGES.success } })
  @UseGuards(AuthGuard())
  @Put('/logout')
  async logout(
    @Req() request: FastifyRequest,
    @UserId() userId: string,
    @OperationId() operationId: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    await this.authService.logout({
      refreshToken: request.cookies.token,
      userId,
      operationId,
    });
    response.clearCookie('token', this.getCookieOptions('delete'));
    return RESPONSE_MESSAGES.success;
  }
}
