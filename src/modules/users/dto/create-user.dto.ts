import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Денис',
    description: 'Имя пользователя',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 15)
  @Matches(/^([A-Za-zА-Яа-я]+)$/)
  readonly userName!: string;

  @ApiProperty({
    example: 'Krainov',
    description: 'Псевдоним пользователя',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 16)
  @Matches(/^([A-Za-z0-9_]+)$/)
  readonly nickName!: string;

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Aдрес электронной почты',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    example: '123425',
    description: 'Пароль',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8)
  readonly password!: string;
}
