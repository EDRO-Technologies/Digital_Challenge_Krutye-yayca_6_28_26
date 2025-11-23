import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
  ) {}

  @Post()
  @ApiBody({ type: CreateScheduleDto })
  create(@Body() dto: CreateScheduleDto) {
    const adminId = 197;
    return this.scheduleService.create(dto, adminId);
  }

  @Put(':id')
  @ApiBody({ type: UpdateScheduleDto })
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    const adminId = 197;
    return this.scheduleService.update(+id, dto, adminId);
  }
}
