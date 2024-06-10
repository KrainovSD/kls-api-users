import { UserCreationArgs } from '@database';
import { ChangeEmailDto, ChangePassDto, DeleteUsersDto } from './dto';

export type DefaultInfo = {
  operationId: string;
};

export type GetByIdOptions = {
  id: string;
  privateFields?: boolean;
} & DefaultInfo;

export type CallChangePassOptions = {
  email: string;
  userId: string;
} & DefaultInfo;

export type ChangePassOptions = {
  dto: ChangePassDto;
  userId: string;
} & DefaultInfo;

export type CallChangeEmailOptions = {
  userId: string;
} & DefaultInfo;

export type ChangeEmailOptions = {
  dto: ChangeEmailDto;
  userId: string;
} & DefaultInfo;

export type ChangeNickNameOptions = {
  nickName: string;
  userId: string;
} & DefaultInfo;

export type ClearAvatarOptions = {
  userId: string;
} & DefaultInfo;

export type UpdateAvatarOptions = {
  incomingFile: IncomingFile;
  userId: string;
} & DefaultInfo;

export type ClearWallpaperOptions = {
  userId: string;
} & DefaultInfo;

export type UpdateWallpaperOptions = {
  incomingFile: IncomingFile;
  userId: string;
} & DefaultInfo;

export type CreateOptions = {
  dto: UserCreationArgs;
} & DefaultInfo;

export type DeleteAllOptions = {
  dto: DeleteUsersDto;
} & DefaultInfo;
export type GetAllOptions = {
  userId: string;
} & DefaultInfo;
export type DeleteOptions = {
  userId: string;
} & DefaultInfo;

export type CheckUniqueEmailOptions = {
  email: string;
} & DefaultInfo;

export type CheckUniqueNickNameOptions = {
  nickName: string;
} & DefaultInfo;
