import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'Krainov',
    description: 'Адрес электронной почты или юзернейм',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly login!: string;

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
