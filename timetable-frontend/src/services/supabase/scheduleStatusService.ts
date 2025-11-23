import { supabase } from '@/lib/supabase';

export interface ScheduleStatus {
    id: number;
    name: string; // 'Запланировано', 'Проведено', 'Отменено' и т.д.
}

export async function getAllScheduleStatuses(): Promise<ScheduleStatus[]> {
    const { data, error } = await supabase
        .from('schedule_item_statuses')
        .select('id, name')
        .order('id', { ascending: true });

    if (error) {
        console.error('Failed to fetch schedule statuses:', error);
        throw error;
    }
    return data;
}

export async function getStatusIdByName(name: string): Promise<number | null> {
    const { data, error } = await supabase
        .from('schedule_item_statuses')
        .select('id')
        .eq('name', name)
        .single();

    if (error) return null;
    return data?.id || null;
}
