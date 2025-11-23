import { supabase } from '@/lib/supabase';

export interface CreateEventPayload {
    title: string;
    description?: string;
    roomId: string;
    groupId?: string | null; // Опционально, если мероприятие для конкретной группы
    startTime: string; // ISO timestamp
    endTime: string;   // ISO timestamp
}

export interface BackendEvent {
    id: string;
    title: string;
    description: string | null;
    room_id: string;
    group_id: string | null;
    start_time: string;
    end_time: string;
    is_lesson: boolean;
    created_at: string;
}

// Создание мероприятия
export async function createEvent(payload: CreateEventPayload) {
    try {
        const { data, error } = await supabase
            .from('schedule_items')
            .insert({
                title: payload.title,
                description: payload.description || null,
                room_id: payload.roomId,
                group_id: payload.groupId || null,
                start_time: payload.startTime,
                end_time: payload.endTime,
                is_lesson: false, // Это мероприятие, не урок
                speaker_id: null, // Для мероприятий speaker_id может быть null
                subject_id: null  // Предмет не нужен для мероприятий
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, eventId: data.id };
    } catch (error: any) {
        console.error('Failed to create event:', error);
        throw error;
    }
}

// Получение всех мероприятий
export async function getAllEvents() {
    try {
        const { data, error } = await supabase
            .from('schedule_items')
            .select(`
                id,
                title,
                description,
                room_id,
                group_id,
                start_time,
                end_time,
                is_lesson,
                created_at,
                rooms (
                    room_number,
                    buildings (code)
                )
            `)
            .eq('is_lesson', false)
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data as BackendEvent[];
    } catch (error: any) {
        console.error('Failed to fetch events:', error);
        throw error;
    }
}

// Удаление мероприятия
export async function deleteEvent(eventId: string) {
    try {
        const { error } = await supabase
            .from('schedule_items')
            .delete()
            .eq('id', eventId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete event:', error);
        throw error;
    }
}
