import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, type DragEndEvent } from '@dnd-kit/core';
import ActionPanel from "@/components/adminPanel/actionPanel/ActionPanel.tsx";
import Layout from "./Layout.tsx";
import ScheduleGrid from "@/components/adminPanel/ScheduleGrid.tsx";
import ActionCard from "@/components/adminPanel/actionPanel/ActionCard.tsx";
import { TeacherModal } from "@/components/adminPanel/TeacherModal.tsx";
import { useScheduleStore, type Teacher } from "@/store/useScheduleStore";
import { EventModal, type EventFormData } from "@/components/adminPanel/EventModal";
import { createEvent } from '@/services/supabase/eventService'; // Импорт сервиса

export default function AdminPanelPage() {
    const assignLesson = useScheduleStore((state) => state.assignLesson);
    const fetchTeachers = useScheduleStore((state) => state.fetchTeachers);
    const fetchGroups = useScheduleStore((state) => state.fetchGroups);
    const fetchClassrooms = useScheduleStore((state) => state.fetchClassrooms);
    const adminMode = useScheduleStore((state) => state.adminMode);

    useEffect(() => {
        fetchTeachers();
        fetchGroups();
        fetchClassrooms();
    }, [fetchTeachers, fetchGroups, fetchClassrooms]);

    const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);

    const [scheduleModal, setScheduleModal] = useState<{
        isOpen: boolean;
        date: Date | null;
        slotId: number | null;
        preSelectedTeacherId: string | null;
        preSelectedSubject: string | null;
    }>({
        isOpen: false,
        date: null,
        slotId: null,
        preSelectedTeacherId: null,
        preSelectedSubject: null,
    });

    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event: any) => {
        if (adminMode === 'schedule') {
            setActiveTeacher(event.active.data.current as Teacher);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (adminMode !== 'schedule') return;

        const { active, over } = event;
        setActiveTeacher(null);

        if (over && active) {
            const [dateStr, slotStr] = (over.id as string).split('|');
            const date = new Date(dateStr);
            const slotId = Number(slotStr);

            const rawId = active.id as string;
            const [cleanId, subjectName] = rawId.split('::');

            setScheduleModal({
                isOpen: true,
                date: date,
                slotId: slotId,
                preSelectedTeacherId: cleanId,
                preSelectedSubject: subjectName || null
            });
        }
    };

    const handleScheduleSave = (teacherId: string, classroomId: string | null) => {
        if (scheduleModal.date && scheduleModal.slotId) {
            const key = `${scheduleModal.date.toISOString().split('T')[0]}|${scheduleModal.slotId}`;
            assignLesson(key, teacherId, classroomId, scheduleModal.preSelectedSubject || undefined);
            setScheduleModal(prev => ({ ...prev, isOpen: false, preSelectedSubject: null }));
        }
    };

    // Обработчик создания события
    const handleEventSave = async (data: EventFormData) => {
        try {
            // Комбинируем дату и время в ISO timestamp
            const startISO = `${data.date}T${data.startTime}:00`;
            const endISO = `${data.date}T${data.endTime}:00`;

            await createEvent({
                title: data.title,
                description: data.description,
                roomId: data.roomId,
                startTime: startISO,
                endTime: endISO,
            });

            alert('Мероприятие успешно создано!');
            // Можно перезагрузить расписание, если нужно отобразить созданное событие
        } catch (error: any) {
            throw new Error('Не удалось создать мероприятие: ' + error.message);
        }
    };

    return (
        <Layout>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-[calc(100vh-4rem)]">
                    <ActionPanel
                        onCreateEventClick={() => setIsEventModalOpen(true)}
                        selectedClassroomId={selectedClassroomId}
                        onSelectClassroom={(id) => setSelectedClassroomId(id === selectedClassroomId ? null : id)}
                    />

                    <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
                        <ScheduleGrid />
                    </div>
                </div>

                <DragOverlay>
                    {activeTeacher ? (
                        <div className="opacity-90 rotate-3 cursor-grabbing">
                            <ActionCard teacher={activeTeacher} isOverlay />
                        </div>
                    ) : null}
                </DragOverlay>

                {scheduleModal.isOpen && scheduleModal.date && (
                    <TeacherModal
                        isOpen={scheduleModal.isOpen}
                        onClose={() => setScheduleModal(prev => ({ ...prev, isOpen: false }))}
                        onSave={handleScheduleSave}
                        currentTeacherId={scheduleModal.preSelectedTeacherId}
                    />
                )}

                {isEventModalOpen && (
                    <EventModal
                        isOpen={isEventModalOpen}
                        onClose={() => setIsEventModalOpen(false)}
                        onSave={handleEventSave}
                        initialData={selectedClassroomId ? { roomId: selectedClassroomId } : undefined}
                    />
                )}
            </DndContext>
        </Layout>
    );
}
