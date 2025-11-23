import { create } from 'zustand';
import { getAllTeachersWithWorkload } from '@/services/supabase/teacherService';
import { getAllGroups, type BackendGroup } from '@/services/supabase/groupsService';
import { getAllRooms } from '@/services/supabase/roomService';
import { getGroupSchedule, BackendLesson } from '@/services/supabase/scheduleService';
import { getAllEvents, type BackendEvent } from '@/services/supabase/eventService';

export type ViewMode = 'day' | 'week' | 'month';
export type AdminMode = 'schedule' | 'events';

export interface WorkloadItem { subject: string; hours: number; semester: number; year: number; hoursLeft: number; }
export interface Teacher { id: string; name: string; subject: string; hoursLeft: number; totalHours: number; workload?: WorkloadItem[]; }
export interface Group { id: string; name: string; course?: number; }
export interface Classroom { id: string; name: string; capacity: number; }
export interface Lesson { teacher: Teacher; classroom: Classroom | null; dbId?: string; }

export interface TimeSlot {
    id: number;
    number: number;
    time: string;
}

// Для мероприятий в UI
export interface UiEvent {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    roomId: string;
    roomName: string;
}

export type ScheduleMap = Record<string, Lesson>; // Ключ: "YYYY-MM-DD|slotId"
export type GlobalSchedule = Record<string, ScheduleMap>; // Ключ: groupId

// Типы для локальных действий
export interface NewTeacher { name: string; subject: string; totalHours: number; }
export interface NewGroup { name: string; }
export interface NewClassroom { name: string; capacity: number; }

interface ScheduleState {
    teachers: Teacher[];
    groups: Group[];
    classrooms: Classroom[];
    events: UiEvent[]; // Список мероприятий

    adminMode: AdminMode;
    selectedGroupId: string | null;

    schedule: GlobalSchedule;
    highlightedTeacherId: string | null;
    isLoading: boolean;
    error: string | null;

    // Основные действия
    setAdminMode: (mode: AdminMode) => void;
    setHighlightedTeacherId: (id: string | null) => void;
    selectGroup: (groupId: string) => void;
    getCurrentGroupSchedule: () => ScheduleMap;

    // Асинхронная загрузка
    fetchTeachers: () => Promise<void>;
    fetchGroups: () => Promise<void>;
    fetchClassrooms: () => Promise<void>;
    fetchSchedule: (groupId: string) => Promise<void>;
    fetchEvents: () => Promise<void>; // Загрузка мероприятий

    assignLesson: (dateKey: string, teacherId: string | null, classroomId: string | null, specificSubject?: string) => void;

    checkTeacherConflict: (dateKey: string, teacherId: string) => string | null;
    checkClassroomConflict: (dateKey: string, classroomId: string) => string | null;

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

// Вспомогательная функция для определения слота по времени
const getSlotIdFromTime = (timeString: string): number => {
    if (timeString.startsWith('09:00')) return 1;
    if (timeString.startsWith('10:45')) return 2;
    if (timeString.startsWith('13:00')) return 3;
    if (timeString.startsWith('14:45')) return 4;
    if (timeString.startsWith('16:30')) return 5;
    if (timeString.startsWith('18:15')) return 6;
    return 1; // Фолбек
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
    teachers: [],
    groups: [],
    classrooms: [],
    events: [],

    adminMode: 'schedule',
    selectedGroupId: null,

    schedule: {},
    highlightedTeacherId: null,
    isLoading: false,
    error: null,

    setAdminMode: (mode) => set({ adminMode: mode }),
    setHighlightedTeacherId: (id) => set({ highlightedTeacherId: id }),

    // Выбор группы + автоматическая загрузка расписания
    selectGroup: (groupId) => {
        set({ selectedGroupId: groupId });
        get().fetchSchedule(groupId);
    },

    getCurrentGroupSchedule: () => {
        const { schedule, selectedGroupId } = get();
        if (!selectedGroupId) return {};
        return schedule[selectedGroupId] || {};
    },

    fetchTeachers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getAllTeachersWithWorkload();
            const mappedTeachers: Teacher[] = data.map((t) => ({
                id: String(t.id), // Принудительно строка
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
            const mappedGroups: Group[] = data.map(g => ({ id: String(g.id), name: g.name, course: g.course }));
            set((state) => ({
                groups: mappedGroups,
                selectedGroupId: !state.selectedGroupId && mappedGroups.length > 0 ? mappedGroups[0].id : state.selectedGroupId,
                isLoading: false
            }));

            const state = get();
            if (state.selectedGroupId) {
                get().fetchSchedule(state.selectedGroupId);
            }
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
                id: String(r.id),
                name: `${r.building_code || ''}-${r.room_number}`,
                capacity: 30
            }));
            set({ classrooms: mappedClassrooms, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch classrooms:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchSchedule: async (groupId: string) => {
        set({ isLoading: true });
        try {
            const backendLessons = await getGroupSchedule(groupId);

            const scheduleMap: ScheduleMap = {};
            const { teachers, classrooms } = get();

            backendLessons.forEach(item => {
                const dateObj = new Date(item.start_time);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${day}`;

                const hours = dateObj.getHours();
                const minutes = dateObj.getMinutes();
                const timeString = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
                const slotId = getSlotIdFromTime(timeString);

                const key = `${dateKey}|${slotId}`;

                const speakerIdStr = item.speaker_id ? String(item.speaker_id) : null;
                const roomIdStr = item.room_id ? String(item.room_id) : null;

                let teacherObj = speakerIdStr ? teachers.find(t => t.id === speakerIdStr) : undefined;

                if (!teacherObj && speakerIdStr) {
                    teacherObj = {
                        id: speakerIdStr,
                        name: item.users?.full_name || 'Неизвестный',
                        subject: item.subjects?.name || 'Предмет',
                        hoursLeft: 0,
                        totalHours: 0
                    };
                }

                let classroomObj = roomIdStr ? classrooms.find(c => c.id === roomIdStr) : undefined;

                if (!classroomObj && roomIdStr) {
                    classroomObj = {
                        id: roomIdStr,
                        name: item.rooms ? `${item.rooms.buildings?.code}-${item.rooms.room_number}` : '???',
                        capacity: 0
                    };
                }

                if (teacherObj) {
                    scheduleMap[key] = {
                        teacher: {
                            ...teacherObj,
                            subject: item.subjects?.name || teacherObj.subject
                        },
                        classroom: classroomObj || null,
                        dbId: String(item.id)
                    };
                }
            });

            set(state => ({
                schedule: {
                    ...state.schedule,
                    [groupId]: scheduleMap
                },
                isLoading: false
            }));

        } catch (err: any) {
            console.error("Failed to fetch schedule", err);
            set({ error: err.message, isLoading: false });
        }
    },

    fetchEvents: async () => {
        set({ isLoading: true });
        try {
            const backendEvents: BackendEvent[] = await getAllEvents();
            const { classrooms } = get();

            const uiEvents: UiEvent[] = backendEvents.map(event => {
                const roomIdStr = event.room_id ? String(event.room_id) : null;
                const room = roomIdStr ? classrooms.find(c => c.id === roomIdStr) : undefined;
                return {
                    id: String(event.id),
                    title: event.title,
                    description: event.description,
                    startTime: new Date(event.start_time),
                    endTime: new Date(event.end_time),
                    roomId: roomIdStr || '',
                    roomName: room?.name || '?',
                };
            });
            set({ events: uiEvents, isLoading: false });
        } catch (err: any) {
            console.error("Failed to fetch events", err);
            set({ error: err.message, isLoading: false });
        }
    },

    assignLesson: (dateKey, teacherId, classroomId, specificSubject) => set((state) => {
        if (!state.selectedGroupId) return state;

        const currentGroupSchedule = state.schedule[state.selectedGroupId] || {};
        let newTeachers = [...state.teachers];
        const currentLesson = currentGroupSchedule[dateKey];
        const realTeacherId = teacherId ? teacherId.split('::')[0] : null;

        if (teacherId === 'clear' || (!teacherId && !currentLesson)) {
            if (currentLesson) {
                newTeachers = newTeachers.map(t =>
                    t.id === currentLesson.teacher.id
                        ? { ...t, hoursLeft: t.hoursLeft + 2 }
                        : t
                );

                const newGroupSchedule = { ...currentGroupSchedule };
                delete newGroupSchedule[dateKey];

                return {
                    schedule: { ...state.schedule, [state.selectedGroupId]: newGroupSchedule },
                    teachers: newTeachers,
                };
            }

            return state;
        }

        let finalTeacher = currentLesson?.teacher;

        if (realTeacherId && realTeacherId !== 'clear') {
            if (currentLesson && currentLesson.teacher.id !== realTeacherId) {
                newTeachers = newTeachers.map(t =>
                    t.id === currentLesson.teacher.id
                        ? { ...t, hoursLeft: t.hoursLeft + 2 }
                        : t
                );
            }

            if (!currentLesson || currentLesson.teacher.id !== realTeacherId) {
                const teacherToAssign = newTeachers.find(t => t.id === realTeacherId);
                if (!teacherToAssign || teacherToAssign.hoursLeft <= 0) return state;

                newTeachers = newTeachers.map(t =>
                    t.id === realTeacherId
                        ? { ...t, hoursLeft: t.hoursLeft - 2 }
                        : t
                );

                const updatedTeacher = newTeachers.find(t => t.id === realTeacherId)!;
                finalTeacher = {
                    ...updatedTeacher,
                    subject: specificSubject || teacherToAssign.subject,
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
                    [dateKey]: { teacher: finalTeacher, classroom: finalClassroom },
                },
            },
            teachers: newTeachers,
        };
    }),

    checkTeacherConflict: (dateKey: string, teacherId: string) => {
        const { schedule } = get();
        const plainId = teacherId.split('::')[0];

        for (const groupId in schedule) {
            const groupSchedule = schedule[groupId];
            const lesson = groupSchedule?.[dateKey];

            // ВАЖНО: Теперь и lesson.teacher.id, и plainId гарантированно строки
            if (lesson && String(lesson.teacher.id) === String(plainId)) {
                return groupId;
            }
        }

        return null;
    },

    checkClassroomConflict: (dateKey: string, classroomId: string) => {
        const { schedule } = get();

        for (const groupId in schedule) {
            const groupSchedule = schedule[groupId];
            const lesson = groupSchedule?.[dateKey];

            if (lesson && lesson.classroom && String(lesson.classroom.id) === String(classroomId)) {
                return groupId;
            }
        }

        return null;
    },

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
