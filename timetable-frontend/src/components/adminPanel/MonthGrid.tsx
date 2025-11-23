import React from 'react';
import type {ScheduleMap} from '@/store/useScheduleStore';

interface MonthGridProps {
    dates: (Date | null)[];
    schedule?: ScheduleMap; // Теперь принимаем расписание
    formatDateKey?: (date: Date) => string;
}

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const MonthGrid: React.FC<MonthGridProps> = ({ dates, schedule, formatDateKey }) => {
    const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
    const fKey = formatDateKey || ((d: Date) => d.toISOString().split('T')[0]);

    // Функция для подсчета пар в день
    const getPairsCount = (date: Date) => {
        if (!schedule) return 0;
        const dateStr = fKey(date);
        // Ищем ключи, которые начинаются с этой даты "YYYY-MM-DD|"
        return Object.keys(schedule).filter(key => key.startsWith(dateStr)).length;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 mb-2">
                {WEEK_DAYS.map(d => (
                    <div key={d} className="text-center text-gray-400 font-medium uppercase text-sm py-2">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-2 flex-1">
                {dates.map((date, i) => {
                    const count = date ? getPairsCount(date) : 0;

                    return (
                        <div
                            key={i}
                            className={`
                rounded-2xl p-2 border min-h-[80px] flex flex-col transition-colors relative
                ${!date ? 'invisible' : ''}
                ${date && isToday(date) ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50 hover:bg-white'}
              `}
                        >
                            {date && (
                                <>
                  <span className={`text-sm font-bold mb-1 ${isToday(date) ? 'text-green-700' : 'text-gray-500'}`}>
                    {date.getDate()}
                  </span>

                                    {/* Индикаторы загруженности */}
                                    {count > 0 && (
                                        <div className="mt-auto flex gap-1 flex-wrap content-end">
                                            {/* Рисуем точки по количеству пар (максимум 6) */}
                                            {Array.from({ length: Math.min(count, 6) }).map((_, idx) => (
                                                <div key={idx} className="h-1.5 w-1.5 rounded-full bg-green-400" title={`${count} пар`}></div>
                                            ))}
                                            {count > 6 && <span className="text-[10px] text-gray-400 leading-none">+</span>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthGrid;
