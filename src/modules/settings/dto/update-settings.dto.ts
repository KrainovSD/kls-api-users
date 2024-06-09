import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    example: 20,
    description: 'Количество изученных слов для одного повторения',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(20)
  @Max(99)
  knownWordsCount!: number;

  @ApiProperty({
    example: 3,
    description:
      'Количество допустимых в слове ошибок в течении всего времени для добавления на повторение',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(3)
  @Max(9)
  mistakesInWordsCount!: number;

  @ApiProperty({
    example: [2, 2, 2, 4, 4, 4, 8, 8],
    description:
      'Регулярность повторения слов с ошибками (интервал между повторениями)',
    required: false,
    type: [Number],
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(16, { each: true })
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
  repeatWordsRegularity!: number[];

  @ApiProperty({
    example: 45,
    description:
      'Промежуток дней, за который высчитывается количество встреч со словом',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(10)
  @Max(90)
  relevanceObserveDay!: number;

  @ApiProperty({
    example: 3,
    description:
      'Количество встреч со словом, которое высчитывается за промежуток дней',
    required: false,
  })
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(3)
  @Max(9)
  relevanceObserveCount!: number;
}
