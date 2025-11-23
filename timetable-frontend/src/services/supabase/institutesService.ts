import { supabase } from '@/lib/supabase';

export interface BackendInstitute {
    id: number;
    name: string;
    short_name: string;
}

// GET - Получить все институты
export async function getAllInstitutes(): Promise<BackendInstitute[]> {
    const { data, error } = await supabase
        .from('institutes')
        .select('id, name, short_name')
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
}
