import { supabase } from "@/lib/supabase";

export interface BackendGroup {
    id: string;
    name: string;
    course: number;
    institute_id?: number | null;
}

// GET - Все группы
export async function getAllGroups(): Promise<BackendGroup[]> {
    const { data, error } = await supabase
        .from("groups")
        .select("id, name, course, institute_id")
        .order("name", { ascending: true });

    if (error) throw error;
    return data.map((g) => ({ ...g, id: String(g.id) }));
}

export async function getGroupsByInstituteId(
    institute_id: number,
): Promise<BackendGroup[]> {
    const { data, error } = await supabase
        .from("groups")
        .select("id, name, course, institute_id")
        .eq("institute_id", institute_id)
        .order("name", { ascending: true });

    if (error) throw error;
    return data.map((g) => ({ ...g, id: String(g.id) }));
}

export async function getCoursesByInstituteId(
    institute_id: number,
): Promise<number[]> {
    const { data, error } = await supabase
        .from("groups")
        .select("course")
        .eq("institute_id", institute_id);

    if (error) throw error;

    const courses = Array.from(new Set(data.map((g) => g.course))).sort(
        (a, b) => a - b,
    );
    return courses;
}

export async function getGroupsByInstituteIdAndCourse(
    institute_id: number,
    course: number,
): Promise<BackendGroup[]> {
    const { data, error } = await supabase
        .from("groups")
        .select("id, name, course, institute_id")
        .eq("institute_id", institute_id)
        .eq("course", course)
        .order("name", { ascending: true });

    if (error) throw error;
    return data.map((g) => ({ ...g, id: String(g.id) }));
}

export async function getGroupById(id: string): Promise<BackendGroup> {
    const { data, error } = await supabase
        .from("groups")
        .select("id, name, course, institute_id")
        .eq("id", id)
        .single();

    if (error) throw error;
    if (!data) throw new Error(`Group with id ${id} not found`);

    return { ...data, id: String(data.id) };
}

// CREATE - Создать группу
export async function createGroup(payload: {
    name: string;
    course: number;
    instituteId?: number | null;
}) {
    const { data, error } = await supabase
        .from("groups")
        .insert({
            name: payload.name,
            course: payload.course,
            institute_id: payload.instituteId || null,
        })
        .select()
        .single();

    if (error) throw error;
    return { success: true, groupId: data.id };
}

// UPDATE - Обновить группу
export async function updateGroup(
    groupId: string,
    payload: { name: string; course: number; instituteId?: number | null },
) {
    const { error } = await supabase
        .from("groups")
        .update({
            name: payload.name,
            course: payload.course,
            institute_id: payload.instituteId || null,
        })
        .eq("id", groupId);

    if (error) throw error;
    return { success: true };
}

// DELETE - Удалить группу
export async function deleteGroup(groupId: string) {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) throw error;
    return { success: true };
}
