import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type Teacher, useScheduleStore } from '@/store/useScheduleStore';
import { GripVertical } from 'lucide-react';

interface ActionCardProps {
    teacher: Teacher;
    isOverlay?: boolean;
    isOverGrid?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ teacher, isOverlay, isOverGrid }) => {
    const highlightedTeacherId = useScheduleStore(state => state.highlightedTeacherId);
    const setHighlightedTeacherId = useScheduleStore(state => state.setHighlightedTeacherId);
    // 1. ПОЛНЫЙ УНИКАЛЬНЫЙ ID (например "uuid-123::Алгебра")
    const uniqueId = String(teacher?.id || '');

    // Теперь мы сравниваем именно с ПОЛНЫМ ID
    const isHighlighted = highlightedTeacherId === uniqueId;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: uniqueId,
        data: {
            current: teacher
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging && !isOverlay ? 0 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : undefined,
    };

    const handleClick = () => {
        if (isHighlighted) {
            setHighlightedTeacherId(null);
        } else {
            setHighlightedTeacherId(uniqueId);
        }
    };

    // --- Прогресс бар ---
    // АДАПТАЦИЯ ПОД НОВУЮ СТРУКТУРУ:
    // Пытаемся взять planned_hours/hours_left, если их нет — берем totalHours/hoursLeft
    const total = teacher.planned_hours ?? teacher.totalHours ?? 1; // Возьмет totalHours
    const current = teacher.hours_left ?? teacher.hoursLeft ?? 0;   // Возьмет hoursLeft

    const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
    const isFinished = current <= 0;

    if (!teacher) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={`
        relative group flex items-center justify-between p-3 mb-2 rounded-xl border transition-all duration-200 select-none overflow-hidden
        ${isHighlighted
                ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02] ring-1 ring-blue-500'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }
        ${isDragging ? 'shadow-xl rotate-2 scale-105' : ''}
      `}
        >
            {/* Фон-трек */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100" />

            {/* Активная полоска */}
            <div
                className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ease-out ${
                    isFinished ? 'bg-gray-300' : 'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
            />

            <div className="flex items-center gap-3 z-10 max-w-[85%]">
                <div className={`
          p-2 rounded-lg transition-colors
          ${isHighlighted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'}
        `}>
                    <GripVertical size={16} />
                </div>

                <div className="flex flex-col min-w-0">
          <span className={`text-sm font-semibold truncate ${isHighlighted ? 'text-blue-900' : 'text-gray-700'}`}>
            {teacher.name}
          </span>
                    <span className="text-xs text-gray-500 truncate">
            {teacher.subject}
          </span>
                </div>
            </div>

            <div className="flex flex-col items-end z-10">
        <span className={`
            text-xs font-bold px-2 py-0.5 rounded-full transition-colors
            ${isFinished
            ? 'bg-gray-100 text-gray-400'
            : 'bg-green-100 text-green-700'
        }
        `}>
          {current}
        </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
          из {total}
        </span>
            </div>
        </div>
    );
};

export default ActionCard;
