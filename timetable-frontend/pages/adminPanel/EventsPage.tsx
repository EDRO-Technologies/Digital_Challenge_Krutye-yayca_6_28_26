import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    type DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor
} from '@dnd-kit/core';

import Layout from './Layout';
import ActionPanel from "@/components/adminPanel/actionPanel/ActionPanel";
import ClassroomCard from "@/components/adminPanel/actionPanel/ClassroomCard"; // Для оверлея
import { ScheduleHeader } from '@/components/adminPanel/ScheduleHeader';
import TimeGrid from '@/components/adminPanel/TimeGrid';
import { EventModal } from '@/components/adminPanel/EventModal';
import { useScheduleStore, type ViewMode, type TimeSlot, type Classroom } from '@/store/useScheduleStore';

const TIME_SLOTS: TimeSlot[] = [
    { id: 1, number: 1, time: '08:30 - 10:00' },
    { id: 2, number: 2, time: '10:10 - 11:40' },
    { id: 3, number: 3, time: '12:10 - 13:40' },
    { id: 4, number: 4, time: '13:50 - 15:20' },
    { id: 5, number: 5, time: '15:30 - 17:00' },
    { id: 6, number: 6, time: '17:10 - 18:40' },
];

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export default function EventsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');

    // Для Dnd
    const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // Стейт модалки (теперь хранит и предвыбранную аудиторию)
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        date: Date | null;
        slotId: number | null;
        preSelectedClassroomId: string | null;
    }>({ isOpen: false, date: null, slotId: null, preSelectedClassroomId: null });

    const selectedGroupId = useScheduleStore(state => state.selectedGroupId);
    const fullSchedule = useScheduleStore(state => state.schedule);
    const bookEvent = useScheduleStore(state => state.bookEvent);
    const assignLesson = useScheduleStore(state => state.assignLesson);

    const currentSchedule = useMemo(() => fullSchedule[selectedGroupId] || {}, [fullSchedule, selectedGroupId]);

    // --- Helpers ---
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };
    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

    const calendarData = useMemo(() => {
        const start = getStartOfWeek(currentDate);
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [currentDate]);

    const headerTitle = `${MONTH_NAMES[getStartOfWeek(currentDate).getMonth()]} ${getStartOfWeek(currentDate).getFullYear()}`;

    // --- Dnd Handlers ---
    const handleDragStart = (event: any) => {
        if (event.active.data.current?.type === 'classroom') {
            setActiveClassroom(event.active.data.current.current as Classroom);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveClassroom(null);

        if (over && active) {
            // Разбираем ID ячейки
            const [dateStr, slotStr] = (over.id as string).split('|');

            // Открываем модалку с уже выбранной аудиторией
            setModalState({
                isOpen: true,
                date: new Date(dateStr),
                slotId: Number(slotStr),
                preSelectedClassroomId: active.id as string // ID аудитории
            });
        }
    };

    // --- Click Handler ---
    const handleCellClick = (date: Date, slotId: number) => {
        const key = `${formatDateKey(date)}|${slotId}`;
        const existing = currentSchedule[key];

        // Если занято - удаляем
        if (existing) {
            if (window.confirm('Очистить этот слот?')) {
                assignLesson(key, 'clear', null);
            }
            return;
        }

        // Если свободно - открываем пустую модалку
        setModalState({
            isOpen: true,
            date,
            slotId,
            preSelectedClassroomId: null
        });
    };

    // --- Save Handler ---
    const handleBook = (eventName: string, classroomId: string) => {
        if (modalState.date && modalState.slotId) {
            const key = `${formatDateKey(modalState.date)}|${modalState.slotId}`;
            bookEvent(key, eventName, classroomId);
        }
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <Layout>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex w-full max-w-422 gap-5 overflow-hidden">
                    {/* БОКОВАЯ ПАНЕЛЬ: Теперь в режиме 'classrooms' */}
                    <ActionPanel mode="classrooms" />

                    <div className="w-full max-w-[1248px] h-[85vh] bg-yellow-50 rounded-[3rem] p-5 flex flex-col gap-5 shadow-xl border border-yellow-100 relative">
                        <ScheduleHeader
                            title={headerTitle}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            onNavigate={(dir) => {
                                const sign = dir === 'next' ? 1 : -1;
                                const newDate = new Date(currentDate);
                                newDate.setDate(newDate.getDate() + sign * 7);
                                setCurrentDate(newDate);
                            }}
                        />

                        <div className="flex-1 bg-white rounded-[2.5rem] p-6 overflow-y-auto shadow-inner">
                            <TimeGrid
                                dates={calendarData}
                                slots={TIME_SLOTS}
                                schedule={currentSchedule}
                                viewMode={viewMode}
                                onCellClick={handleCellClick}
                                formatDateKey={formatDateKey}
                                activeDraggingTeacherId={null} // Здесь мы учителей не таскаем
                            />
                        </div>
                    </div>
                </div>

                {/* Модалка */}
                {modalState.isOpen && modalState.date && (
                    <EventModal
                        selection={{ date: modalState.date, slotId: modalState.slotId }}
                        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                        onSave={handleBook}
                        initialClassroomId={modalState.preSelectedClassroomId} // Передаем предвыбранную аудиторию
                    />
                )}

                {/* Оверлей при перетаскивании */}
                <DragOverlay dropAnimation={null}>
                    {activeClassroom ? (
                        <div className="w-[300px] cursor-grabbing">
                            <ClassroomCard classroom={activeClassroom} isOverlay />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </Layout>
    );
}
