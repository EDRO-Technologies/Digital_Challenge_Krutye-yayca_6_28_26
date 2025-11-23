import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly telegram: TelegramService,
  ) {}

  // вспомогательный метод: разослать уведомление по группе
  private async notifyGroupAboutLesson(
    scheduleItem: any,
    type: 'created' | 'updated',
  ) {
    const groupId = scheduleItem.group_id;
    if (!groupId) return;

    // 1. Достаём студентов группы с привязанным телеграмом
    const { data: students, error: studentsError } = await this.supabase.db
      .from('users')
      .select('full_name, telegram_id')
      .eq('group_id', groupId)
      .not('telegram_id', 'is', null); // telegram_id IS NOT NULL [web:59][web:62]

    if (studentsError) {
      // на демо можно просто залогировать и не падать
      console.error(
        'Failed to fetch students for group',
        groupId,
        studentsError,
      );
      return;
    }

    if (!students || students.length === 0) return;

    // 2. Формируем текст уведомления
    const actionText =
      type === 'created' ? 'Добавлена новая пара' : 'Пара изменена';
    const subjectName = scheduleItem.subjects?.name ?? 'Предмет';
    const groupName = scheduleItem.groups?.name ?? 'Группа';
    const room = scheduleItem.rooms?.room_number ?? 'не указана';
    const startLocal = new Date(scheduleItem.start_time).toLocaleString(
      'ru-RU',
    );

    const text = [
      `📢 ${actionText}`,
      `🎓 Группа: ${groupName}`,
      `📚 Предмет: ${subjectName}`,
      `🚪 Аудитория: ${room}`,
      `⏰ Начало: ${startLocal}`,
    ].join('\n');

    // 3. Шлём каждому студенту; для наших масштабов можно просто Promise.all
    await Promise.all(
      students.map((s) =>
        this.telegram.sendMessage(s.telegram_id as string, text),
      ),
    );
  }

  // 1. ОБЫЧНОЕ СОЗДАНИЕ (Single)
  async create(dto: CreateScheduleDto, adminId: number) {
    const { data: newItem, error } = await this.supabase.db
      .from('schedule_items')
      .insert(dto)
      .select()
      .maybeSingle()

    if (error) {
      throw new HttpException(
        this.mapSupabaseError(error),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Логируем создание (old=null)
    await this.logChange(newItem.id, adminId, null, newItem);

    // Уведомляем группу
    this.notifyGroupAboutLesson(newItem, 'created');

    return newItem;
  }

  async update(id: number, dto: UpdateScheduleDto, adminId: number) {
    // 1. Сначала получаем "старую" версию для логов
    const { data: oldItem, error: fetchError } = await this.supabase.db
      .from('schedule_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !oldItem) {
      throw new HttpException('Занятие не найдено', HttpStatus.NOT_FOUND);
    }

    // 2. Выполняем обновление
    const { data: newItem, error: updateError } = await this.supabase.db
      .from('schedule_items')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      throw new HttpException(updateError.message, HttpStatus.BAD_REQUEST);
    }

    // Мы не ждем await здесь, чтобы интерфейс работал быстрее
    this.logChange(id, adminId, oldItem, newItem);

    // 4. Если изменилось время или аудитория — шлем уведомления студентам
    if (
      oldItem.start_time !== newItem.start_time ||
      oldItem.room_id !== newItem.room_id
    ) {
      this.notifyGroupAboutLesson(newItem, 'updated');
    }

    return newItem;
  }

  private mapSupabaseError(error: any): string {
    // Ошибка уникальности (кто-то уже записался или такое время занято)
    if (error.code === '23505') {
      // Можно проверять error.message или error.details, чтобы понять конкретнее
      if (error.message.includes('users_phone_number_key'))
        return 'Пользователь с таким телефоном уже есть';
      if (error.message.includes('event_participants_pkey'))
        return 'Вы уже записаны на это мероприятие';
      return 'Такая запись уже существует';
    }

    // Ошибки наших кастомных Constraint-ов (которые мы в SQL создавали)
    if (error.message.includes('no_room_overlap'))
      return 'Эта аудитория уже занята в указанное время!';
    if (error.message.includes('no_teacher_overlap'))
      return 'У преподавателя уже стоит пара в это время!';
    if (error.message.includes('no_group_overlap'))
      return 'У группы уже есть занятие в это время!';

    // Дефолтная ошибка
    return error.message || 'Ошибка базы данных';
  }

  private async logChange(
    scheduleId: number,
    adminId: number,
    oldVal: any | null,
    newVal: any | null,
  ) {
    // Создание: oldVal == null, newVal != null
    if (!oldVal && newVal) {
      await this.supabase.db.from('schedule_changes').insert({
        schedule_item_id: scheduleId,
        changed_by: adminId,
        old_values: null,
        new_values: newVal,
      });
      return;
    }

    // Удаление: oldVal != null, newVal == null
    if (oldVal && !newVal) {
      await this.supabase.db.from('schedule_changes').insert({
        schedule_item_id: scheduleId,
        changed_by: adminId,
        old_values: oldVal,
        new_values: null,
      });
      return;
    }

    // Обычное обновление: есть и oldVal, и newVal
    const changes: Record<string, { from: any; to: any }> = {};
    let hasChanges = false;

    for (const key in newVal) {
      if (key === 'updated_at' || key === 'created_at') continue;

      if (oldVal[key] != newVal[key]) {
        changes[key] = { from: oldVal[key], to: newVal[key] };
        hasChanges = true;
      }
    }

    if (!hasChanges) return;

    await this.supabase.db.from('schedule_changes').insert({
      schedule_item_id: scheduleId,
      changed_by: adminId,
      old_values: oldVal,
      new_values: newVal,
      // при желании можно добавить поле diff в схему и класть туда `changes`
    });
  }
}
