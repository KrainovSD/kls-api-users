import { IsUUID } from 'class-validator';

export class GetSettingsMessageDto {
  @IsUUID('4', { message: 'Должно быть в формате UUID' })
  userId!: string;
}
