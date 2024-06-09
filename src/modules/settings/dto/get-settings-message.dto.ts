import { IsUUID } from 'class-validator';

export class GetSettingsMessageDto {
  @IsUUID('4')
  userId!: string;
}
