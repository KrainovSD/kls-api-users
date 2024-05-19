import { UpdateSettingsDto } from './dto';

export type DefaultInfo = {
  operationId: string;
};

export type UpdateSettingsOptions = {
  dto: UpdateSettingsDto;
  userId: string;
} & DefaultInfo;

export type CreateSettingsOptions = {
  userId: string;
} & DefaultInfo;

export type GetSettingsByUserIdOptions = {
  userId: string;
} & DefaultInfo;
