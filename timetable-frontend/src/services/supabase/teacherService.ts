import { supabase } from "@/lib/supabase";

export interface BackendTeacher {
    id: string;
    name: string;
    total_hours: number;
    workload: {
        subject: string;
        hours: number;
        semester: number;
        year: number;
    }[];
}

export async function getAllTeachersWithWorkload(): Promise<BackendTeacher[]> {
    const { data, error } = await supabase
        .from("users")
        .select(
            `
      id,
      full_name,
      roles!inner ( name ),
      teacher_workload (
        planned_hours,
        semester,
        start_year,
        subjects ( name )
      )
    `,
        )
        .eq("roles.name", "Преподаватель")
        .order("full_name", { ascending: true });

    if (error) throw error;

    // Преобразуем в удобный формат
    return data.map((teacher: any) => {
        const workloadItems = teacher.teacher_workload || [];

        // Считаем общее количество часов
        const totalHours = workloadItems.reduce(
            (sum: number, item: any) => sum + (item.planned_hours || 0),
            0,
        );

        return {
            id: String(teacher.id),
            name: teacher.full_name,
            total_hours: totalHours,
            workload: workloadItems.map((w: any) => ({
                subject: w.subjects?.name || "Без предмета",
                hours: w.planned_hours,
                semester: w.semester,
                year: w.start_year,
            })),
        };
    });
}

export async function getAllTeachers(): Promise<BackendTeacher[]> {
    const { data, error } = await supabase
        .from("users")
        .select(
            `
            id,
            full_name,
            roles!inner ( name )
        `,
        )
        .eq("roles.name", "Преподаватель")
        .order("full_name", { ascending: true });

    if (error) throw error;

    return data.map((teacher: any) => ({
        id: String(teacher.id),
        name: teacher.full_name,
        total_hours: 0, 
        workload: [],
    }));
}

export async function getTeacherById(id: string): Promise<BackendTeacher> {
    const { data, error } = await supabase
        .from("users")
        .select(
            `
            id,
            full_name,
            roles!inner ( name )
        `,
        )
        .eq("id", id)
        .single();

    if (error) throw error;
    if (!data) throw new Error(`Teacher with id ${id} not found`);

    return {
        id: String(data.id),
        name: data.full_name,
        total_hours: 0, 
        workload: [],
    };
}

export interface WorkloadPayload {
    subjectName: string;
    hours: number;
    semester: number;
    year: number;
}

export interface CreateTeacherPayload {
    fullName: string;
    workload: WorkloadPayload[];
}

export async function createTeacherWithWorkload(payload: CreateTeacherPayload) {
    // ... (код из предыдущего ответа)
    // Вставьте сюда логику создания из предыдущего шага
    try {
        // 1. Получаем ID роли "Преподаватель"
        const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "Преподаватель")
            .single();

        if (roleError || !roleData)
            throw new Error('Role "Преподаватель" not found');
        const teacherRoleId = roleData.id;

        // 2. Создаем пользователя
        const { data: userData, error: userError } = await supabase
            .from("users")
            .insert({
                full_name: payload.fullName,
                role_id: teacherRoleId,
            })
            .select()
            .single();

        if (userError) throw userError;
        const newTeacherId = userData.id;

        // 3. Создаем нагрузку
        await createWorkloadEntries(newTeacherId, payload.workload);

        return { success: true, teacherId: newTeacherId };
    } catch (error: any) {
        console.error("Error creating teacher:", error);
        throw error;
    }
}

export async function updateTeacherWithWorkload(
    teacherId: string,
    payload: CreateTeacherPayload,
) {
    try {
        // 1. Обновляем имя пользователя
        const { error: userError } = await supabase
            .from("users")
            .update({ full_name: payload.fullName })
            .eq("id", teacherId);

        if (userError) throw userError;

        // 2. Обновляем нагрузку (Стратегия: Удалить все старое -> Создать новое)
        // Сначала удаляем старую нагрузку
        const { error: deleteWorkloadError } = await supabase
            .from("teacher_workload")
            .delete()
            .eq("teacher_id", teacherId);

        if (deleteWorkloadError) throw deleteWorkloadError;

        // 3. Создаем новую нагрузку
        await createWorkloadEntries(teacherId, payload.workload);

        return { success: true };
    } catch (error: any) {
        console.error("Error updating teacher:", error);
        throw error;
    }
}

export async function deleteTeacher(teacherId: string) {
    try {
        // Удаляем пользователя.
        // Если в БД стоит ON DELETE CASCADE для teacher_workload, нагрузка удалится сама.
        // Если нет - сначала удаляем нагрузку. Предположим, что каскад есть или удаляем вручную.

        // Удаляем нагрузку вручную для надежности
        await supabase
            .from("teacher_workload")
            .delete()
            .eq("teacher_id", teacherId);

        // Удаляем пользователя
        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", teacherId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting teacher:", error);
        throw error;
    }
}

// Вспомогательная функция для создания записей нагрузки
async function createWorkloadEntries(
    teacherId: string,
    workload: WorkloadPayload[],
) {
    for (const item of workload) {
        let subjectId;

        // Ищем или создаем предмет
        const { data: existingSubject } = await supabase
            .from("subjects")
            .select("id")
            .eq("name", item.subjectName)
            .single();

        if (existingSubject) {
            subjectId = existingSubject.id;
        } else {
            const { data: newSubject, error: createSubjectError } =
                await supabase
                    .from("subjects")
                    .insert({ name: item.subjectName })
                    .select()
                    .single();

            if (createSubjectError) throw createSubjectError;
            subjectId = newSubject.id;
        }

        // Записываем нагрузку
        const { error: workloadError } = await supabase
            .from("teacher_workload")
            .insert({
                teacher_id: teacherId,
                subject_id: subjectId,
                planned_hours: item.hours,
                start_year: item.year,
                semester: item.semester,
            });

        if (workloadError) throw workloadError;
    }
}
