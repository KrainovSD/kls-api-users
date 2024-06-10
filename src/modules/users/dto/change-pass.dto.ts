import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePassDto {
  @ApiProperty({
    example: '242452',
    description: 'Уникальный ключ',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly key!: string;

  @ApiProperty({
    example: '123425',
    description: 'Пароль',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, undefined)
  readonly password!: string;
}
