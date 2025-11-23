import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { TelegramModule } from './telegram/telegram.module';
import { ScheduleController } from './schedule/schedule.controller';
import { ScheduleService } from './schedule/schedule.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SupabaseModule, TelegramModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class AppModule {}
