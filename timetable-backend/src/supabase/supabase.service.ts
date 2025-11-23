import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/database.types';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is missing in .env file');
    }

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
    this.logger.log('Supabase Client initialized');
  }

  // Геттер для удобства
  get db() {
    return this.client;
  }
}
