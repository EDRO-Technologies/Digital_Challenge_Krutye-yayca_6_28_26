// src/services/subjectService.ts
import { supabase } from '@/lib/supabase';

export async function getSubjectIdByName(name: string): Promise<number | null> {
    if (!name.trim()) return null;

    const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', name)
        .single();

    if (error) {
        console.error('Failed to get subject by name', error);
        return null;
    }

    return typeof data?.id === 'number' ? data.id : Number(data?.id ?? null);
}
