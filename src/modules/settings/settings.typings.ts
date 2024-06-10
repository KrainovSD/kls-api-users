import { UpdateSettingsDto } from './dto';

export type DefaultInfo = {
  operationId: string;
};

export type UpdateSettingsOptions = {
  dto: UpdateSettingsDto;
  userId: string;
} & DefaultInfo;
