import React, { useState, useMemo } from 'react';
import { ScheduleHeader } from './ScheduleHeader';
import TimeGrid from './TimeGrid';
import MonthGrid from './MonthGrid';
import {
    type ViewMode,
    type TimeSlot,
    useScheduleStore,
    type Lesson,
} from '@/store/useScheduleStore';

// --- ТИПЫ ---
interface ScheduleGridProps {
    onModalRequest?: (
        date: Date,
        slotId: number,
        preSelectedTeacherId?: string | null,
    ) => void;
    // ПРОП для клика по уроку
    onLessonClick?: (lesson: Lesson, date: Date, slotId: number) => void;

    // НОВЫЙ ПРОП от страницы (активный перетаскиваемый преподаватель)
    activeTeacherId?: string | null;
}

const TIME_SLOTS: TimeSlot[] = [
    { id: 1, number: 1, time: '09:00 - 10:30' },
    { id: 2, number: 2, time: '10:45 - 12:15' },
    { id: 3, number: 3, time: '13:00 - 14:30' },
    { id: 4, number: 4, time: '14:45 - 16:15' },
    { id: 5, number: 5, time: '16:30 - 18:00' },
    { id: 6, number: 6, time: '18:15 - 19:45' },
];

const MONTH_NAMES = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
                                                       onModalRequest,
                                                       onLessonClick,
                                                       activeTeacherId,
                                                   }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');

    const adminMode = useScheduleStore((state) => state.adminMode);
    const isLoading = useScheduleStore((state) => state.isLoading);
    const selectedGroupId = useScheduleStore((state) => state.selectedGroupId);
    const schedule = useScheduleStore((state) => state.schedule);
    const allEvents = useScheduleStore((state) => state.events);

    // для конфликтов и режима клика по карточке преподавателя
    const highlightedTeacherId = useScheduleStore(
        (state) => state.highlightedTeacherId,
    );
    const checkTeacherConflict = useScheduleStore(
        (state) => state.checkTeacherConflict,
    );

    const currentSchedule = useMemo(() => {
        if (!selectedGroupId) return {};
        return schedule[selectedGroupId] || {};
    }, [schedule, selectedGroupId]);

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const calendarData = useMemo(() => {
        if (viewMode === 'week') {
            const start = getStartOfWeek(currentDate);
            return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                return d;
            });
        }

        if (viewMode === 'month') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            return Array.from({ length: daysInMonth }, (_, i) => {
                return new Date(year, month, i + 1);
            });
        }

        return [currentDate];
    }, [currentDate, viewMode]);

    const headerTitle = useMemo(() => {
        if (viewMode === 'month') {
            return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
        if (viewMode === 'day') {
            return `${currentDate.getDate()} ${
                MONTH_NAMES[currentDate.getMonth()]
            }`;
        }
        const start = getStartOfWeek(currentDate);
        return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    }, [currentDate, viewMode]);

    const handleNavigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        const sign = direction === 'next' ? 1 : -1;

        if (viewMode === 'day') newDate.setDate(newDate.getDate() + sign);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + sign * 7);
        else if (viewMode === 'month')
            newDate.setMonth(newDate.getMonth() + sign);

        setCurrentDate(newDate);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ScheduleHeader
                title={headerTitle}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onNavigate={handleNavigate}
            />

            <div className="flex-1 overflow-auto custom-scrollbar">
                {isLoading && !Object.keys(currentSchedule).length && !allEvents.length ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        Загрузка...
                    </div>
                ) : viewMode === 'month' ? (
                    <MonthGrid days={calendarData} schedule={{ ...currentSchedule }} />
                ) : (
                    <TimeGrid
                        timeSlots={TIME_SLOTS}
                        days={calendarData}
                        schedule={currentSchedule}
                        events={allEvents}
                        mode={adminMode}
                        onModalRequest={onModalRequest}
                        onLessonClick={onLessonClick}
                        viewMode={viewMode}
                    />
                )}
            </div>
        </div>
    );
};

export default ScheduleGrid;
