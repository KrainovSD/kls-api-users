import { CreateUserDto } from '@modules';

import { ConfirmDto } from './dto/confirm.dto';
import { LoginDto } from './dto/login.dto';

export type DefaultInfo = {
  operationId: string;
};

export type RegisterOptions = {
  userDto: CreateUserDto;
} & DefaultInfo;

export type ConfirmOptions = {
  confirmDto: ConfirmDto;
} & DefaultInfo;

export type LoginOptions = {
  loginDto: LoginDto;
} & DefaultInfo;

export type TokenOptions = {
  refreshToken: string | undefined;
} & DefaultInfo;

export type LogoutOptions = {
  refreshToken: string | undefined;
  userId: string;
} & DefaultInfo;
