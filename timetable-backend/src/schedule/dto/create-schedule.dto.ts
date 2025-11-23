import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ example: 10, description: 'ID предмета' })
  @IsNumber()
  subject_id: number;

  @ApiProperty({ example: 5, description: 'ID преподавателя' })
  @IsNumber()
  speaker_id: number;

  @ApiProperty({ example: 3, description: 'ID аудитории' })
  @IsNumber()
  room_id: number;

  @ApiProperty({ example: 1, description: 'ID группы' })
  @IsNumber()
  group_id: number;

  @ApiProperty({
    example: '2025-11-24T08:30:00+05:00',
    description: 'Начало занятия (ISO 8601)'
  })
  @IsDateString()
  start_time: string;

  @ApiProperty({
    example: '2025-11-24T10:00:00+05:00',
    description: 'Конец занятия (ISO 8601)'
  })
  @IsDateString()
  end_time: string;

  @ApiPropertyOptional({
    example: 'лек',
    description: 'Тип занятия (лек/пр/лаб)'
  })
  @IsString()
  @IsOptional()
  title?: string;
}
