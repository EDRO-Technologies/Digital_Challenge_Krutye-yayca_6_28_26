import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { type Lesson } from '@/store/useScheduleStore';

interface MonthGridProps {
    days: Date[];
    schedule: Record<string, Lesson>;
}

// Компонент ячейки дня (Drop Zone) с вашей стилистикой
const MonthDayCell: React.FC<{
    day: Date;
    lessons: Lesson[];
    formatDateKey: (d: Date) => string;
}> = ({ day, lessons, formatDateKey }) => {
    const dateKey = formatDateKey(day);

    // Сохраняем логику dnd
    const { setNodeRef, isOver } = useDroppable({
        id: dateKey,
        data: { date: day }
    });

    const isToday = day.toDateString() === new Date().toDateString();

    return (
        <div
            ref={setNodeRef}
            className={`
                bg-white min-h-[120px] p-2 flex flex-col border border-transparent 
                transition-colors group
                ${isOver ? 'bg-blue-50 ring-2 ring-blue-200 z-10' : 'hover:bg-gray-50 hover:border-gray-200'}
            `}
        >
            {/* Число (справа вверху, как в дизайне) */}
            <div className={`
                self-end text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors
                ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700 group-hover:text-black'}
            `}>
                {day.getDate()}
            </div>

            {/* Список уроков (как в дизайне: синие карточки) */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[140px]">
                {lessons.map((lesson, idx) => (
                    <div key={idx} className="p-1 bg-blue-100 border border-blue-200 rounded text-[10px] text-blue-900 truncate">
                        <span className="font-bold mr-1">{lesson.teacher.subject}</span>
                        {lesson.classroom && <span className="opacity-70 ml-1">{lesson.classroom.name}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MonthGrid: React.FC<MonthGridProps> = ({ days, schedule }) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Используем переданные дни или генерируем сами
    const targetDays = days.length > 0 ? days : Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));

    const firstDayIndex = (targetDays[0].getDay() + 6) % 7; // Пн = 0

    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

    return (
        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 h-full min-h-[600px]">
            {/* Заголовки (как в дизайне) */}
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(dayName => (
                <div key={dayName} className="bg-white py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    {dayName}
                </div>
            ))}

            {/* Пустые ячейки (как в дизайне) */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-gray-50/30 min-h-[120px]" />
            ))}

            {/* Дни */}
            {targetDays.map((day) => {
                const dateKey = formatDateKey(day);
                const dayLessons = Object.entries(schedule || {})
                    .filter(([key]) => key.startsWith(dateKey))
                    .map(([_, lesson]) => lesson);

                return (
                    <MonthDayCell
                        key={dateKey}
                        day={day}
                        lessons={dayLessons}
                        formatDateKey={formatDateKey}
                    />
                );
            })}
        </div>
    );
};

export default MonthGrid;
