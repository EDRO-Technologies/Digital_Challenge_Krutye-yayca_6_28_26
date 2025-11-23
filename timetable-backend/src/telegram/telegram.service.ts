import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Bot, Context, Filter } from 'grammy';
import { SupabaseService } from '../supabase/supabase.service';

export type MyContext = Context;

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Bot<MyContext>;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly supabase: SupabaseService) {
    this.bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN as string);
  }

  async onModuleInit() {
    // Обработчик команды
    this.bot.command('start', this.onStart.bind(this));

    // Обработчик контакта
    // Благодаря строке 'message:contact' TS внутри коллбека знает типы,
    // но если мы выносим функцию - нужно типизировать вручную (см. ниже)
    this.bot.on('message:contact', this.onContact.bind(this));

    this.bot.start({
      onStart: () => this.logger.log('Telegram Bot started'),
    });
  }

  // --- Handlers (Вынесены в методы для чистоты) ---

  private async onStart(ctx: MyContext) {
    await ctx.reply('Привет! Отправь мне свой контакт.', {
      reply_markup: {
        keyboard: [[{ text: '📱 Отправить контакт', request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  }
  private async onContact(ctx: Filter<MyContext, 'message:contact'>) {
    // Теперь тут работает автодополнение, и TS не ругается на undefined
    const contact = ctx.message.contact;
    const telegramId = ctx.from.id.toString();

    const phone = contact.phone_number.replace('+', '');

    this.logger.log(`Auth attempt: ${phone}`);

    const { data: user, error } = await this.supabase.db
      .from('users')
      .select('*')
      .or(`phone_number.eq.${phone},phone_number.eq.+${phone}`)
      .single();

    if (error || !user) {
      await ctx.reply('❌ Номер не найден.');
      return;
    }

    await this.supabase.db
      .from('users')
      .update({ telegram_id: telegramId })
      .eq('id', user.id);

    await ctx.reply(`✅ Авторизован как ${user.full_name}`);
  }

  async sendMessage(chatId: string | number, text: string) {
    await this.bot.api.sendMessage(chatId, text, { parse_mode: 'HTML' });
  }
}
