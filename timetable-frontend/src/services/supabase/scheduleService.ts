import { supabase } from '@/lib/supabase';

// Тип для элемента расписания с раскрытыми связями
export interface BackendScheduleItem {
    id: string;
    subject_id: number;
    subject_name: string;
    
    speaker_id: number;
    speaker_name: string;
    
    room_id: number;
    room_number: string;
    room_building?: string;
    
    group_id: number;
    group_name: string;
    
    subgroup: number | null; 
    
    start_time: string;
    end_time: string;
    title: string;
    description: string;
    is_lesson: boolean;
    status_id: number;
    status_name: string;
    status_color: string;
}

function mapScheduleItem(item: any): BackendScheduleItem {
    return {
        id: String(item.id),
        subject_id: item.subject_id,
        subject_name: item.subjects?.name || 'Без предмета',
        
        speaker_id: item.speaker_id,
        speaker_name: item.users?.full_name || 'Не указан',
        
        room_id: item.room_id,
        room_number: item.rooms?.room_number || '???',
        room_building: item.rooms?.buildings?.name,
        
        subgroup: item.subgroup, 
        
        group_id: item.group_id,
        group_name: item.groups?.name || 'Неизвестная группа',
        
        start_time: item.start_time,
        end_time: item.end_time,
        title: item.title,
        description: item.description,
        is_lesson: item.is_lesson,
        status_id: item.status,
        status_name: item.schedule_item_statuses?.name || 'Неизвестно',
        status_color: item.schedule_item_statuses?.color || '#cccccc'
    };
}

const BASE_QUERY = `
    id,
    subject_id,
    speaker_id,
    room_id,
    group_id,
    start_time,
    end_time,
    title,
    description,
    is_lesson,
    status,
    subgroup,  
    subjects ( name ),
    users ( full_name ),
    rooms ( room_number, buildings ( name ) ),
    groups ( name ),
    schedule_item_statuses ( name, color )
`;

export async function getScheduleByGroupId(groupId: string): Promise<BackendScheduleItem[]> {
    const { data, error } = await supabase
        .from('schedule_items')
        .select(BASE_QUERY)
        .eq('group_id', groupId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data.map(mapScheduleItem);
}

export async function getScheduleByTeacherId(teacherId: string): Promise<BackendScheduleItem[]> {
    const { data, error } = await supabase
        .from('schedule_items')
        .select(BASE_QUERY)
        .eq('speaker_id', teacherId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data.map(mapScheduleItem);
}

export async function getScheduleByRoomId(roomId: string): Promise<BackendScheduleItem[]> {
    const { data, error } = await supabase
        .from('schedule_items')
        .select(BASE_QUERY)
        .eq('room_id', roomId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data.map(mapScheduleItem);
}
