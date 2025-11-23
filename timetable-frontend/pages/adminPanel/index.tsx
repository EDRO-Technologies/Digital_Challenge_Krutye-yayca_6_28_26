import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    type DragEndEvent,
    type DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';

import ActionPanel from '@/components/adminPanel/actionPanel/ActionPanel.tsx';
import Layout from './Layout.tsx';
import ScheduleGrid from '@/components/adminPanel/ScheduleGrid.tsx';
import ActionCard from '@/components/adminPanel/actionPanel/ActionCard.tsx';
import { TeacherModal } from '@/components/adminPanel/TeacherModal.tsx';
import { useScheduleStore, type Teacher } from '@/store/useScheduleStore';

// Импорт сервисов
import { createScheduleLesson, updateScheduleLesson } from '@/services/scheduleApi';
import { getSubjectIdByName } from '@/services/supabase/subjectService';
import { getStatusIdByName } from '@/services/supabase/scheduleStatusService';

// Маппинг слотов в время
const SLOT_TIME_RANGES: Record<number, { start: string; end: string }> = {
    1: { start: '09:00', end: '10:30' },
    2: { start: '10:45', end: '12:15' },
    3: { start: '13:00', end: '14:30' },
    4: { start: '14:45', end: '16:15' },
    5: { start: '16:30', end: '18:00' },
    6: { start: '18:15', end: '19:45' },
};

export default function AdminPanelPage() {
    const assignLesson = useScheduleStore((state) => state.assignLesson);
    const teachers = useScheduleStore((state) => state.teachers);
    const selectedGroupId = useScheduleStore((state) => state.selectedGroupId);
    const fetchTeachers = useScheduleStore((state) => state.fetchTeachers);
    const fetchGroups = useScheduleStore((state) => state.fetchGroups);
    const fetchClassrooms = useScheduleStore((state) => state.fetchClassrooms);
    const fetchEvents = useScheduleStore((state) => state.fetchEvents);
    const checkTeacherConflict = useScheduleStore((state) => state.checkTeacherConflict);

    useEffect(() => {
        fetchTeachers();
        fetchGroups();
        fetchClassrooms();
        fetchEvents();
    }, []);

    const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
    const [isOverGrid, setIsOverGrid] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        date: Date | null;
        slotId: number | null;
        preSelectedTeacherId: string | null;
        preSelectedSubjectName: string | null;
    }>({
        isOpen: false,
        date: null,
        slotId: null,
        preSelectedTeacherId: null,
        preSelectedSubjectName: null,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    const handleDragStart = (event: any) => {
        setActiveTeacher(event.active.data.current as Teacher);
        setIsOverGrid(false);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setIsOverGrid(!!over);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTeacher(null);
        setIsOverGrid(false);

        if (!over || !active) return;

        const overId = String(over.id);
        let date: Date;
        let slotId: number;

        if (overId.includes('|')) {
            const [dateStr, slotStr] = overId.split('|');
            date = new Date(dateStr);
            slotId = Number(slotStr);
        } else {
            date = new Date(overId);
            slotId = 1;
        }

        const rawId = String(active.id);
        const [cleanTeacherId, subjectName] = rawId.split('::');

        const datePart = date.toISOString().split('T')[0];
        const key = `${datePart}|${slotId}`;

        if (checkTeacherConflict && checkTeacherConflict(key, cleanTeacherId)) {
            return;
        }

        setModalState({
            isOpen: true,
            date,
            slotId,
            preSelectedTeacherId: cleanTeacherId,
            preSelectedSubjectName: subjectName || null,
        });
        setEditingLessonId(null);
    };

    // Создание новой пары через "плюсик" или клик по ячейке
    const handleModalRequest = (
        date: Date,
        slotId: number,
        preSelectedTeacherId?: string | null,
    ) => {
        // Если препод передан (через клик по зелёной ячейке), ищем его, чтобы узнать предмет
        const teacher = preSelectedTeacherId
            ? teachers.find(t => String(t.id) === String(preSelectedTeacherId))
            : null;

        setModalState({
            isOpen: true,
            date,
            slotId,
            preSelectedTeacherId: preSelectedTeacherId || null,
            preSelectedSubjectName: teacher ? teacher.subject : null, // <-- ВАЖНО
        });
        setEditingLessonId(null);
    };

    // Редактирование существующей пары
    const handleLessonClick = (lesson: any, date: Date, slotId: number) => {
        setEditingLessonId(Number(lesson.dbId));
        setModalState({
            isOpen: true,
            date,
            slotId,
            preSelectedTeacherId: lesson.teacher.id,
            preSelectedSubjectName: lesson.teacher.subject,
        });
    };

    const handleModalSave = async (teacherId: string, classroomId: string | null) => {
        if (!modalState.date || !modalState.slotId) return;

        if (!selectedGroupId) {
            alert('Выберите группу!');
            return;
        }

        const datePart = modalState.date.toISOString().split('T')[0];
        const slotRange = SLOT_TIME_RANGES[modalState.slotId];
        if (!slotRange) return;

        const start_time = `${datePart}T${slotRange.start}:00`;
        const end_time = `${datePart}T${slotRange.end}:00`;
        const key = `${datePart}|${modalState.slotId}`;

        if (teacherId === 'clear') {
            assignLesson(key, 'clear', null);

            if (editingLessonId) {
                try {
                    const canceledStatusId = (await getStatusIdByName('Отменена')) || 10;
                    console.log('Canceling lesson:', editingLessonId, 'Status:', canceledStatusId);
                    await updateScheduleLesson(editingLessonId, {
                        id: editingLessonId,
                        status: canceledStatusId as any,
                    });

                    const fetchSchedule = useScheduleStore.getState().fetchSchedule;
                    if (selectedGroupId) {
                        await fetchSchedule(selectedGroupId);
                    }
                    await fetchTeachers();

                } catch (e) {
                    console.error('Failed to cancel lesson:', e);
                }
            }

            setModalState((prev) => ({ ...prev, isOpen: false }));
            setEditingLessonId(null);
            return;
        }

        assignLesson(key, teacherId, classroomId);

        try {
            const teacher = teachers.find((t) => t.id === teacherId);
            if (!teacher) {
                console.error('Teacher not found:', teacherId);
                alert('Преподаватель не найден!');
                return;
            }

            const subjectName = modalState.preSelectedSubjectName || teacher.subject;
            console.log('Subject name:', subjectName);

            const subject_id = await getSubjectIdByName(subjectName);
            console.log('Subject ID:', subject_id);

            if (!subject_id) {
                console.error('Subject not found:', subjectName);
                alert(`Предмет "${subjectName}" не найден в базе данных!`);
                return;
            }

            if (!classroomId) {
                console.error('Classroom not selected');
                alert('Выберите аудиторию!');
                return;
            }

            const payload = {
                subject_id,
                speaker_id: Number(teacherId),
                room_id: Number(classroomId),
                group_id: Number(selectedGroupId),
                start_time,
                end_time,
                title: subjectName,
            };

            if (editingLessonId) {
                console.log('Updating lesson:', editingLessonId);
                await updateScheduleLesson(editingLessonId, {
                    ...payload,
                    id: editingLessonId,
                });
            } else {
                console.log('Creating new lesson');
                await createScheduleLesson(payload);
            }

            const fetchSchedule = useScheduleStore.getState().fetchSchedule;
            if (selectedGroupId) {
                await fetchSchedule(selectedGroupId);
            }

            await fetchTeachers();

        } catch (e) {
            console.error('Failed to save lesson on backend', e);
            alert('Ошибка при сохранении: ' + (e as Error).message);
        }

        setModalState((prev) => ({ ...prev, isOpen: false }));
        setEditingLessonId(null);
    };


    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <Layout>
                <div className="flex h-full gap-4 overflow-hidden max-h-screen">
                    <ActionPanel />

                    <div className="flex-1">
                        <ScheduleGrid
                            onModalRequest={handleModalRequest}
                            onLessonClick={handleLessonClick}
                            activeTeacherId={activeTeacher?.id || null}
                        />
                    </div>
                </div>
            </Layout>

            <DragOverlay>
                {activeTeacher ? <ActionCard teacher={activeTeacher} /> : null}
            </DragOverlay>

            {modalState.isOpen && modalState.date && (
                <TeacherModal
                    selection={{ date: modalState.date, slotId: modalState.slotId! }}
                    onClose={() => {
                        setModalState((prev) => ({ ...prev, isOpen: false }));
                        setEditingLessonId(null);
                    }}
                    onSave={handleModalSave}
                    initialTeacherId={modalState.preSelectedTeacherId}
                />
            )}
        </DndContext>
    );
}
