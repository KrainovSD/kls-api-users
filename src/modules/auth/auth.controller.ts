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
import { CookieSerializeOptions } from '@fastify/cookie';
import { OperationId, UserId } from '@krainovsd/nest-utils';
import { AuthGuard } from '@krainovsd/nest-jwt-service';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  EXPIRES_COOKIES_ACCESS_TOKEN,
  EXPIRES_COOKIES_REFRESH_TOKEN,
  RESPONSE_MESSAGES,
  ROUTE_PREFIX,
} from '@constants';
import { COOKIE_NAME_ACCESS_TOKEN, COOKIE_NAME_REFRESH_TOKEN } from '@config';

import { AuthService } from './auth.service';
import { ConfirmDto, LoginDto } from './dto';
import { CreateUserDto } from '../users';

@ApiTags('Авторизация')
@Controller(`${ROUTE_PREFIX.v1}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions(
    type: 'create' | 'delete',
    expires: number,
  ): CookieSerializeOptions {
    return {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: type === 'create' ? expires : 0,
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
      COOKIE_NAME_REFRESH_TOKEN,
      tokens.refresh,
      this.getCookieOptions('create', EXPIRES_COOKIES_REFRESH_TOKEN),
    );
    if (COOKIE_NAME_ACCESS_TOKEN)
      response.setCookie(
        COOKIE_NAME_ACCESS_TOKEN,
        tokens.access,
        this.getCookieOptions('create', EXPIRES_COOKIES_ACCESS_TOKEN),
      );
    return { token: tokens.access };
  }

  @ApiOkResponse({
    schema: { example: { token: 'token' } },
  })
  @Put('/token')
  async token(
    @Req() request: FastifyRequest,
    @OperationId() operationId: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const token = await this.authService.token({
      refreshToken: request.cookies[COOKIE_NAME_REFRESH_TOKEN],
      operationId,
    });

    if (COOKIE_NAME_ACCESS_TOKEN)
      response.setCookie(
        COOKIE_NAME_ACCESS_TOKEN,
        token,
        this.getCookieOptions('create', EXPIRES_COOKIES_ACCESS_TOKEN),
      );

    return { token };
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
    response.clearCookie(
      COOKIE_NAME_REFRESH_TOKEN,
      this.getCookieOptions('delete', EXPIRES_COOKIES_REFRESH_TOKEN),
    );
    if (COOKIE_NAME_ACCESS_TOKEN)
      response.clearCookie(
        COOKIE_NAME_ACCESS_TOKEN,
        this.getCookieOptions('delete', EXPIRES_COOKIES_ACCESS_TOKEN),
      );
    return RESPONSE_MESSAGES.success;
  }
}
