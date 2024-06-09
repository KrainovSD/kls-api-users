import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmDto {
  @ApiProperty({
    example: '4212512',
    description: 'Уникальный ключ сгенерированный сервером',
  })
  @IsNotEmpty()
  @IsString()
  readonly key!: string;
}
