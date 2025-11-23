import { create } from 'zustand';
import { getAllTeachersWithWorkload } from '@/services/supabase/teacherService';
import { getAllGroups, type BackendGroup } from '@/services/supabase/groupsService';
import { getAllRooms } from '@/services/supabase/roomService'; // Добавлен импорт

// --- Типы ---

export type ViewMode = 'day' | 'week' | 'month';
export type AdminMode = 'schedule' | 'events'; // НОВЫЙ ТИП

export interface TimeSlot {
    id: number;
    number: number;
    time: string;
}

export interface WorkloadItem {
    subject: string;
    hours: number;
    semester: number;
    year: number;
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    hoursLeft: number;
    totalHours: number;
    workload?: WorkloadItem[];
}

export interface Group {
    id: string;
    name: string;
    course?: number;
}

export interface Classroom {
    id: string;
    name: string;
    capacity: number;
}

export interface Lesson {
    teacher: Teacher;
    classroom: Classroom | null;
}

export type ScheduleMap = Record<string, Lesson>;
export type GlobalSchedule = Record<string, ScheduleMap>;

// (NewTeacher, NewGroup и прочие интерфейсы можно оставить для локального CRUD, если используются)
export interface NewTeacher { name: string; subject: string; totalHours: number; }
export interface NewGroup { name: string; }
export interface NewClassroom { name: string; capacity: number; }


interface ScheduleState {
    teachers: Teacher[];
    groups: Group[];
    classrooms: Classroom[];

    adminMode: AdminMode; // НОВОЕ ПОЛЕ
    selectedGroupId: string | null;

    schedule: GlobalSchedule;
    highlightedTeacherId: string | null;
    isLoading: boolean;
    error: string | null;

    // Экшены
    setAdminMode: (mode: AdminMode) => void; // НОВЫЙ ЭКШЕН

    fetchTeachers: () => Promise<void>;
    fetchGroups: () => Promise<void>;
    fetchClassrooms: () => Promise<void>; // НОВЫЙ ЭКШЕН

    assignLesson: (dateKey: string, teacherId: string | null, classroomId: string | null, specificSubject?: string) => void;
    selectGroup: (groupId: string) => void;
    setHighlightedTeacherId: (id: string | null) => void;
    getCurrentGroupSchedule: () => ScheduleMap;

    // ... (проверки конфликтов и прочее)
    checkTeacherConflict: (dateKey: string, teacherId: string) => string | null;
    checkClassroomConflict: (dateKey: string, classroomId: string) => string | null;

    // CRUD (если нужны локальные обновления)
    addTeacher: (data: NewTeacher) => void;
    addGroup: (data: NewGroup) => void;
    addClassroom: (data: NewClassroom) => void;
    updateTeacher: (id: string, data: Partial<Teacher>) => void;
    updateGroup: (id: string, data: Partial<Group>) => void;
    updateClassroom: (id: string, data: Partial<Classroom>) => void;
    deleteTeacher: (id: string) => void;
    deleteGroup: (id: string) => void;
    deleteClassroom: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
    teachers: [],
    groups: [],
    classrooms: [], // Теперь начинаем с пустого массива

    adminMode: 'schedule', // По умолчанию
    selectedGroupId: null,

    schedule: {},
    highlightedTeacherId: null,
    isLoading: false,
    error: null,

    setAdminMode: (mode) => set({ adminMode: mode }),
    setHighlightedTeacherId: (id) => set({ highlightedTeacherId: id }),
    selectGroup: (groupId) => set({ selectedGroupId: groupId }),

    getCurrentGroupSchedule: () => {
        const { schedule, selectedGroupId } = get();
        if (!selectedGroupId) return {};
        return schedule[selectedGroupId] || {};
    },

    // --- ЗАГРУЗКА ДАННЫХ ---
    fetchTeachers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getAllTeachersWithWorkload();
            const mappedTeachers: Teacher[] = data.map((t) => ({
                id: t.id,
                name: t.name,
                totalHours: t.total_hours,
                hoursLeft: t.total_hours,
                subject: t.workload && t.workload.length > 0 ? t.workload[0].subject : 'Нет нагрузки',
                workload: t.workload
            }));
            set({ teachers: mappedTeachers, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch teachers:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchGroups: async () => {
        set({ isLoading: true });
        try {
            const data: BackendGroup[] = await getAllGroups();
            const mappedGroups: Group[] = data.map(g => ({
                id: g.id,
                name: g.name,
                course: g.course
            }));
            set((state) => ({
                groups: mappedGroups,
                selectedGroupId: !state.selectedGroupId && mappedGroups.length > 0
                    ? mappedGroups[0].id
                    : state.selectedGroupId,
                isLoading: false
            }));
        } catch (error: any) {
            console.error('Failed to fetch groups:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchClassrooms: async () => {
        set({ isLoading: true });
        try {
            const data = await getAllRooms();
            const mappedClassrooms: Classroom[] = data.map(r => ({
                id: r.id,
                name: `${r.building_code || ''}-${r.room_number}`, // Формируем название "У-408"
                capacity: 30 // Пока хардкод или добавить в БД
            }));
            set({ classrooms: mappedClassrooms, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch classrooms:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    // ... (assignLesson и остальные методы остаются без изменений)
    assignLesson: (dateKey, teacherId, classroomId, specificSubject) => set((state) => {
        if (!state.selectedGroupId) return state;

        const currentGroupSchedule = state.schedule[state.selectedGroupId] || {};
        let newTeachers = [...state.teachers];
        const currentLesson = currentGroupSchedule[dateKey];
        const realTeacherId = teacherId ? teacherId.split('::')[0] : null;

        if (teacherId === 'clear' || (!teacherId && !currentLesson)) {
            if (currentLesson) {
                newTeachers = newTeachers.map(t => t.id === currentLesson.teacher.id ? { ...t, hoursLeft: t.hoursLeft + 2 } : t);
            }
            const newGroupSchedule = { ...currentGroupSchedule };
            delete newGroupSchedule[dateKey];
            return {
                schedule: { ...state.schedule, [state.selectedGroupId]: newGroupSchedule },
                teachers: newTeachers
            };
        }

        let finalTeacher = currentLesson?.teacher;

        if (realTeacherId && realTeacherId !== 'clear') {
            if (currentLesson && currentLesson.teacher.id !== realTeacherId) {
                newTeachers = newTeachers.map(t => t.id === currentLesson.teacher.id ? { ...t, hoursLeft: t.hoursLeft + 2 } : t);
            }
            if (!currentLesson || currentLesson.teacher.id !== realTeacherId) {
                const teacherToAssign = newTeachers.find(t => t.id === realTeacherId);
                if (!teacherToAssign || teacherToAssign.hoursLeft <= 0) return state;
                newTeachers = newTeachers.map(t => t.id === realTeacherId ? { ...t, hoursLeft: t.hoursLeft - 2 } : t);
                finalTeacher = {
                    ...newTeachers.find(t => t.id === realTeacherId)!,
                    subject: specificSubject || teacherToAssign.subject
                };
            }
        }

        if (!finalTeacher) return state;

        let finalClassroom = currentLesson?.classroom || null;
        if (classroomId !== undefined) {
            if (classroomId === null) {
                finalClassroom = null;
            } else {
                finalClassroom = state.classrooms.find(c => c.id === classroomId) || null;
            }
        }

        return {
            schedule: {
                ...state.schedule,
                [state.selectedGroupId]: {
                    ...currentGroupSchedule,
                    [dateKey]: {
                        teacher: finalTeacher,
                        classroom: finalClassroom
                    }
                }
            },
            teachers: newTeachers,
        };
    }),

    checkTeacherConflict: () => null, // Заглушки, если не используются
    checkClassroomConflict: () => null,
    addTeacher: () => {},
    addGroup: () => {},
    addClassroom: () => {},
    updateTeacher: () => {},
    updateGroup: () => {},
    updateClassroom: () => {},
    deleteTeacher: () => {},
    deleteGroup: () => {},
    deleteClassroom: () => {},
}));
