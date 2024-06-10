import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CallChangePassDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Aдрес электронной почты',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;
}
