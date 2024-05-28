import { ChangeEmailDto, ChangePassDto, DeleteUsersDto } from './dto';
import { UserCreationArgs } from './users.model';

export type DefaultInfo = {
  operationId: string;
};

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

export type CreateUserOptions = {
  dto: UserCreationArgs;
} & DefaultInfo;

export type DeleteUsersOptions = {
  dto: DeleteUsersDto;
} & DefaultInfo;

export type GetUserByEmailOptions = { email: string } & DefaultInfo;

export type GetUserByNickNameOptions = { nickName: string } & DefaultInfo;

export type GetUserByIdServiceOptions = { id: string } & DefaultInfo;

export type GetUserByIdOptions = {
  id: string;
  privateFields?: boolean;
} & DefaultInfo;

export type GetAllUserOptions = {
  userId: string;
} & DefaultInfo;

export type GetUserByEmailChangeKey = {
  key: string;
} & DefaultInfo;

export type GetUserByPasswordChangeKeyOptions = {
  key: string;
} & DefaultInfo;

export type GetUserByEmailOrNickNameOptions = {
  login: string;
} & DefaultInfo;

export type GetUserByTokenAndIdOptions = {
  token: string;
  id: string;
} & DefaultInfo;

export type DeleteUserByIdOptions = {
  id: string;
} & DefaultInfo;

export type CheckUniqueEmailOptions = {
  email: string;
} & DefaultInfo;

export type CheckUniqueNickNameOptions = {
  nickName: string;
} & DefaultInfo;
