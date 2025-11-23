import React, { useState, useMemo } from 'react';
import { ScheduleHeader } from './ScheduleHeader';
import TimeGrid from './TimeGrid';
import MonthGrid from './MonthGrid';
import { type ViewMode, type TimeSlot, useScheduleStore } from '@/store/useScheduleStore';

// НОВЫЕ ПРОПСЫ: onModalRequest
interface ScheduleGridProps {
    activeDraggingTeacherId?: string | null;
    onModalRequest: (date: Date, slotId: number, preSelectedTeacherId?: string | null) => void;
}

const TIME_SLOTS: TimeSlot[] = [
    { id: 1, number: 1, time: '08:30 - 10:00' },
    { id: 2, number: 2, time: '10:10 - 11:40' },
    { id: 3, number: 3, time: '12:10 - 13:40' },
    { id: 4, number: 4, time: '13:50 - 15:20' },
    { id: 5, number: 5, time: '15:30 - 17:00' },
    { id: 6, number: 6, time: '17:10 - 18:40' },
];

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ activeDraggingTeacherId, onModalRequest }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');

    // Selectors
    const selectedGroupId = useScheduleStore((state) => state.selectedGroupId);
    const fullSchedule = useScheduleStore((state) => state.schedule);
    const highlightedTeacherId = useScheduleStore((state) => state.highlightedTeacherId);

    // Для удаления по клику
    const assignLesson = useScheduleStore((state) => state.assignLesson);

    const currentSchedule = useMemo(() => {
        return fullSchedule[selectedGroupId] || {};
    }, [fullSchedule, selectedGroupId]);

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

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
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const days = [];
            const startDayOfWeek = (firstDay.getDay() + 6) % 7;
            for (let i = 0; i < startDayOfWeek; i++) days.push(null);
            for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
            return days;
        }
        return [currentDate];
    }, [currentDate, viewMode]);

    const headerTitle = useMemo(() => {
        if (viewMode === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        if (viewMode === 'day') return `${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()]}`;
        const start = getStartOfWeek(currentDate);
        return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    }, [currentDate, viewMode]);

    const handleNavigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        const sign = direction === 'next' ? 1 : -1;
        if (viewMode === 'day') newDate.setDate(newDate.getDate() + sign);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + sign * 7);
        else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + sign);
        setCurrentDate(newDate);
    };

    // Клик по ячейке
    const handleCellClick = (date: Date, slotId: number) => {
        // Если режим "Быстрого назначения"
        if (highlightedTeacherId) {
            const key = `${formatDateKey(date)}|${slotId}`;
            const currentLesson = currentSchedule[key];

            // Если кликаем по тому же учителю -> Удаляем
            if (currentLesson && currentLesson.teacher.id === highlightedTeacherId) {
                assignLesson(key, 'clear', null);
                return;
            }

            // Иначе -> Открываем модалку, но уже с выбранным учителем
            onModalRequest(date, slotId, highlightedTeacherId);
            return;
        }

        // Обычный клик -> Открываем пустую модалку
        onModalRequest(date, slotId, null);
    };

    return (
        <div className="w-full max-w-[1248px] h-[85vh] bg-green-100 rounded-[3rem] p-5 flex flex-col gap-5 font-sans overflow-hidden shadow-xl border border-green-200 relative">
            <ScheduleHeader
                title={headerTitle}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onNavigate={handleNavigate}
            />

            <div className="flex-1 bg-white rounded-[2.5rem] p-6 overflow-y-auto shadow-inner">
                {viewMode === 'month' ? (
                    <MonthGrid
                        dates={calendarData}
                        schedule={currentSchedule}
                        formatDateKey={formatDateKey}
                    />
                ) : (
                    <TimeGrid
                        activeDraggingTeacherId={activeDraggingTeacherId || null}
                        dates={calendarData as Date[]}
                        slots={TIME_SLOTS}
                        schedule={currentSchedule}
                        viewMode={viewMode}
                        onCellClick={handleCellClick}
                        formatDateKey={formatDateKey}
                    />
                )}
            </div>

            {/* Модалку отсюда убрали, она теперь выше */}
        </div>
    );
};

export default ScheduleGrid;
