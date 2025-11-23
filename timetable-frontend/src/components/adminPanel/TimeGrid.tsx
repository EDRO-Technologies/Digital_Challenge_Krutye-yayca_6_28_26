import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { type TimeSlot, type ViewMode, type Lesson, useScheduleStore } from '@/store/useScheduleStore';

// --- Интерфейсы ---

interface TimeGridProps {
    dates: Date[];
    slots: TimeSlot[];
    schedule: Record<string, Lesson>;
    viewMode: ViewMode;
    onCellClick: (date: Date, slotId: number) => void;
    formatDateKey: (date: Date) => string;
    activeDraggingTeacherId: string | null;
}

interface DroppableCellProps {
    date: Date;
    slotId: number;
    lesson?: Lesson;
    onClick: () => void;
    formatDateKey: (date: Date) => string;
    activeDraggingTeacherId: string | null;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
                                                         date,
                                                         slotId,
                                                         lesson,
                                                         onClick,
                                                         formatDateKey,
                                                         activeDraggingTeacherId
                                                     }) => {
    const cellId = `${formatDateKey(date)}|${slotId}`;
    const { setNodeRef, isOver } = useDroppable({ id: cellId });

    const highlightedTeacherId = useScheduleStore(state => state.highlightedTeacherId);
    const checkTeacherConflict = useScheduleStore(state => state.checkTeacherConflict);

    // Определяем, кого проверяем (для драг-н-дропа или быстрого назначения)
    const teacherToCheckId = activeDraggingTeacherId || highlightedTeacherId;

    // 1. Проверка конфликтов (только если мы пытаемся назначить учителя)
    let conflictGroupName: string | null = null;
    if (teacherToCheckId) {
        conflictGroupName = checkTeacherConflict(cellId, teacherToCheckId);
    }

    // 2. Логика стилей
    let bgClass = 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white';
    let content = null;
    let isInteractive = true;

    // --- СЦЕНАРИЙ A: КОНФЛИКТ (Красный) ---
    if (conflictGroupName) {
        bgClass = 'bg-red-50/80 border-red-200 opacity-90 cursor-not-allowed';
        isInteractive = false;

        content = (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
                {/* Если там уже был учитель, показываем его зачеркнутым */}
                {lesson && lesson.teacher && (
                    <span className="text-[10px] text-gray-400 line-through mb-1">{lesson.teacher.name}</span>
                )}

                <span className="text-red-600 font-bold text-xs leading-tight flex flex-col items-center">
                   <span className="text-[10px] uppercase text-red-400 mb-0.5">Занят</span>
                   <span className="text-[10px] text-black/60">{conflictGroupName}</span>
               </span>
            </div>
        );
    }
    // --- СЦЕНАРИЙ B: ДРАГ (Синий при наведении) ---
    else if (activeDraggingTeacherId && isOver) {
        bgClass = 'bg-blue-50 border-blue-500 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.5)] scale-[1.02] z-10';
        content = <span className="text-2xl text-blue-500 font-light">↓</span>;
    }
    // --- СЦЕНАРИЙ C: ПОДСВЕТКА ДОСТУПНЫХ (Зеленый пунктир) ---
    else if (highlightedTeacherId && !lesson) {
        bgClass = 'bg-white border-dashed border-2 border-green-200 hover:border-green-400';
        content = <span className="text-green-200 text-xl font-light">+</span>;
    }
        // --- СЦЕНАРИЙ D: МЕРОПРИЯТИЕ (Желтый) ---
    // Добавили проверку типа (если lesson существует и type === 'event' или нет учителя)
    else if (lesson && (lesson.type === 'event' || !lesson.teacher)) {
        bgClass = 'bg-yellow-50 border-yellow-200 hover:border-yellow-400';
        content = (
            <>
                <span className="text-[8px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Мероприятие</span>
                <span className="text-xs font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                    {lesson.eventName || 'Событие'}
                </span>

                {lesson.classroom && (
                    <span className="text-[9px] text-black font-bold px-2 py-0.5 bg-yellow-200 rounded-full truncate max-w-full">
                        {lesson.classroom.name.split(' ')[0]}
                    </span>
                )}
            </>
        );
    }
    // --- СЦЕНАРИЙ E: ОБЫЧНАЯ ПАРА (Зеленый) ---
    else if (lesson && lesson.teacher) {
        bgClass = 'bg-green-50 border-green-200 hover:border-green-300';
        content = (
            <>
                <span className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">
                    {lesson.teacher.name}
                </span>

                <div className="mt-1 flex items-center gap-1 w-full justify-center flex-wrap px-1">
                    <span className="text-[9px] text-green-700 font-medium px-1.5 py-0.5 bg-green-100 rounded-full truncate max-w-full">
                        {lesson.teacher.subject}
                    </span>

                    {lesson.classroom ? (
                        <span className="text-[9px] text-blue-700 font-bold px-1.5 py-0.5 bg-blue-100 rounded-full truncate max-w-full" title={lesson.classroom.name}>
                           {lesson.classroom.name.split(' ')[0]}
                        </span>
                    ) : (
                        <span className="text-[9px] text-red-500 font-bold px-1.5 py-0.5 bg-red-100 rounded-full animate-pulse">
                           Нет ауд.
                        </span>
                    )}
                </div>
            </>
        );
    }
    else {
        content = (
            <span className={`text-2xl font-light transition-colors ${teacherToCheckId ? 'text-gray-200' : 'text-gray-300 group-hover:text-green-400'}`}>
              +
            </span>
        );
    }

    return (
        <div
            ref={setNodeRef}
            onClick={isInteractive ? onClick : undefined}
            className={`
                relative h-24 rounded-2xl border-2 transition-all p-2 flex flex-col justify-center items-center text-center group
                ${bgClass}
            `}
        >
            {content}
        </div>
    );
};

export const TimeGrid: React.FC<TimeGridProps> = ({
                                                      dates,
                                                      slots,
                                                      schedule,
                                                      viewMode,
                                                      onCellClick,
                                                      formatDateKey,
                                                      activeDraggingTeacherId
                                                  }) => {
    const gridColsClass = viewMode === 'week' ? 'grid-cols-[100px_repeat(7,_1fr)]' : 'grid-cols-[100px_1fr]';

    return (
        <div className="min-w-[800px]">
            <div className={`grid ${gridColsClass} mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100`}>
                <div className="text-gray-400 font-medium flex items-end pb-2 pl-2">Время</div>
                {dates.map((date, i) => (
                    <div key={i} className="text-center pb-2">
                        <div className="text-2xl font-bold">{date.getDate()}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                {slots.map((slot) => (
                    <div key={slot.id} className={`grid ${gridColsClass} gap-2`}>
                        <div className="flex flex-col justify-center text-right pr-4 py-3 h-full">
                            <span className="text-lg font-bold text-gray-900">{slot.number} пара</span>
                            <span className="text-xs text-gray-400 font-medium mt-0.5">{slot.time}</span>
                        </div>

                        {dates.map((date, index) => {
                            const key = `${formatDateKey(date)}|${slot.id}`;
                            return (
                                <DroppableCell
                                    key={`${index}-${slot.id}`}
                                    date={date}
                                    slotId={slot.id}
                                    lesson={schedule[key]}
                                    formatDateKey={formatDateKey}
                                    onClick={() => onCellClick(date, slot.id)}
                                    activeDraggingTeacherId={activeDraggingTeacherId}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeGrid;
