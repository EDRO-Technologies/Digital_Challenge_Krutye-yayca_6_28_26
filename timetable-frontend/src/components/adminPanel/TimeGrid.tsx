import React from 'react';
import { useDroppable } from '@dnd-kit/core';

import {
    type TimeSlot,
    type Lesson,
    type UiEvent,
    type AdminMode,
    type ViewMode,
} from '@/store/useScheduleStore';

interface TimeGridProps {
    timeSlots: TimeSlot[];
    days: Date[];
    schedule: Record<string, Lesson>;
    events: UiEvent[];
    mode: AdminMode;
    onModalRequest?: (
        date: Date,
        slotId: number,
        preSelectedTeacherId?: string | null,
    ) => void;
    onLessonClick?: (lesson: Lesson, date: Date, slotId: number) => void;

    activeTeacherId?: string | null;
    checkTeacherConflict?: (dateKey: string, teacherId: string) => string | null;
    highlightedTeacherId?: string | null;
    viewMode?: ViewMode;
}

// --- КАРТОЧКИ ---

const LessonCard: React.FC<{ lesson: Lesson; isDayMode?: boolean }> = ({
                                                                           lesson,
                                                                           isDayMode,
                                                                       }) => (
    <div
        className={`
      p-3 bg-blue-100 border border-blue-200 rounded-xl h-full
      flex flex-col justify-between text-blue-900 cursor-pointer
      hover:shadow-md transition-all
      ${isDayMode ? 'max-w-full' : 'max-w-42'}
    `}
    >
        <div>
            <p className="text-xs font-bold truncate">{lesson.teacher.subject}</p>
            <p className="text-xs truncate">{lesson.teacher.name}</p>
        </div>
        {lesson.classroom && (
            <p className="text-[10px] font-medium self-end bg-blue-200/50 px-1 rounded">
                {lesson.classroom.name}
            </p>
        )}
    </div>
);

const EventCard: React.FC<{ event: UiEvent }> = ({ event }) => (
    <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-xl h-full flex flex-col justify-between text-yellow-900">
        <div>
            <p className="text-xs font-bold truncate">{event.title}</p>
            {event.description && <p className="text-xs truncate">{event.description}</p>}
        </div>
        <p className="text-[10px] font-medium self-end bg-yellow-200/50 px-1 rounded">
            {event.roomName}
        </p>
    </div>
);

// --- ЯЧЕЙКА ---

interface TimeSlotCellProps {
    id: string;
    lesson?: Lesson;
    event?: UiEvent;
    mode: AdminMode;
    date: Date;
    slotId: number;
    onModalRequest?: (
        date: Date,
        slotId: number,
        preSelectedTeacherId?: string | null,
    ) => void;
    onLessonClick?: (lesson: Lesson, date: Date, slotId: number) => void;

    activeTeacherId?: string | null;
    checkTeacherConflict?: (dateKey: string, teacherId: string) => string | null;
    highlightedTeacherId?: string | null;
    viewMode?: ViewMode;
}

const TimeSlotCell: React.FC<TimeSlotCellProps> = ({
                                                       id,
                                                       lesson,
                                                       event,
                                                       mode,
                                                       date,
                                                       slotId,
                                                       onModalRequest,
                                                       onLessonClick,
                                                       activeTeacherId,
                                                       checkTeacherConflict,
                                                       highlightedTeacherId,
                                                       viewMode,
                                                   }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const dateKey = id;
    const teacherForCheck = activeTeacherId || highlightedTeacherId || null;

    // Проверяем конфликт
    const hasConflict =
        teacherForCheck && checkTeacherConflict
            ? !!checkTeacherConflict(dateKey, teacherForCheck)
            : false;

    const handleClick = () => {
        if (hasConflict) {
            alert('Этот преподаватель уже занят в это время в другой группе!');
            return;
        }

        if (lesson) {
            onLessonClick?.(lesson, date, slotId);
            return;
        }

        // Если нет урока и конфликта — открываем модалку
        // Передаём highlightedTeacherId, чтобы модалка открылась с уже выбранным преподом
        const preTeacherId = highlightedTeacherId || null;
        onModalRequest?.(date, slotId, preTeacherId);
    };

    const baseClasses =
        'h-32 p-1 border-t border-gray-100 transition-colors relative group';

    // ЛОГИКА СТИЛЕЙ
    let stateClasses = 'bg-white';

    if (hasConflict) {
        // Красный при конфликте (и при клике, и при драге)
        stateClasses = 'bg-red-100 border-2 border-red-500 cursor-not-allowed z-20';
    } else if (isOver) {
        stateClasses = 'bg-blue-50';
    } else if (highlightedTeacherId && !lesson && !event) {
        // Зелёный, если выбран препод и слот свободен
        stateClasses = 'bg-green-50 cursor-pointer hover:bg-green-100';
    }

    return (
        <div
            ref={setNodeRef}
            className={`${baseClasses} ${stateClasses}`}
            onClick={handleClick}
        >
            {mode === 'schedule' && lesson && (
                <div
                    className="h-full w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!hasConflict) {
                            onLessonClick?.(lesson, date, slotId);
                        }
                    }}
                >
                    <LessonCard lesson={lesson} isDayMode={viewMode === 'day'} />
                </div>
            )}

            {mode === 'events' && event && <EventCard event={event} />}

            {!lesson && !event && !hasConflict && (
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handleClick}
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center shadow-sm border border-gray-200">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                </div>
            )}

            {hasConflict && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-500 text-red-600 flex items-center justify-center shadow-md">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

const TimeGrid: React.FC<TimeGridProps> = ({
                                               timeSlots,
                                               days,
                                               schedule,
                                               events,
                                               mode,
                                               onModalRequest,
                                               onLessonClick,
                                               activeTeacherId,
                                               checkTeacherConflict,
                                               highlightedTeacherId,
                                               viewMode,
                                           }) => {
    // Используем локальную дату для ключа
    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDayName = (date: Date, short = false) => {
        const format = short ? 'short' : 'long';
        return new Intl.DateTimeFormat('ru-RU', { weekday: format }).format(date);
    };

    const gridTemplateColumns = `auto repeat(${days.length}, 1fr)`;

    return (
        <div className="grid h-full min-w-max" style={{ gridTemplateColumns }}>
            <div className="sticky left-0 bg-white z-10 border-r border-b border-gray-100 flex flex-col">
                <div className="h-20" />
                {timeSlots.map((slot) => (
                    <div
                        key={slot.id}
                        className="h-32 flex items-center justify-center p-2 border-t border-gray-100 text-center"
                    >
                        <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">
                {slot.number}
              </span>
                            <span className="text-[10px] text-gray-400">{slot.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {days.map((day, dayIndex) => (
                <div key={dayIndex} className="flex flex-col border-r border-gray-100">
                    <div className="h-20 sticky top-0 bg-white z-10 flex items-center justify-center border-b border-gray-100 p-2 text-center">
                        <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-semibold capitalize">
                {getDayName(day)}
              </span>
                            <span className="text-2xl font-bold text-gray-800">
                {day.getDate()}
              </span>
                        </div>
                    </div>

                    {timeSlots.map((slot) => {
                        const key = `${formatDateKey(day)}|${slot.id}`;
                        const lesson = schedule[key];

                        const event = events.find((e) => {
                            const eventStart = new Date(e.startTime);
                            const slotHour = parseInt(slot.time.split(':')[0]);
                            return (
                                eventStart.toDateString() === day.toDateString() &&
                                eventStart.getHours() === slotHour
                            );
                        });

                        return (
                            <TimeSlotCell
                                key={slot.id}
                                id={key}
                                lesson={lesson}
                                event={event}
                                mode={mode}
                                date={day}
                                slotId={slot.id}
                                onModalRequest={onModalRequest}
                                onLessonClick={onLessonClick}
                                activeTeacherId={activeTeacherId}
                                checkTeacherConflict={checkTeacherConflict}
                                highlightedTeacherId={highlightedTeacherId}
                                viewMode={viewMode}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default TimeGrid;
