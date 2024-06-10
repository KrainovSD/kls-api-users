import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Aдрес электронной почты',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    example: '242452',
    description: 'Уникальный ключ',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly key!: string;
}
