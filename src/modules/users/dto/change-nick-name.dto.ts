import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ChangeNickNameDto {
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
}
