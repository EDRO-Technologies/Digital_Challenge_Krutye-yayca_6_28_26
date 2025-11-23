import React from 'react';
import { type Classroom } from '@/store/useScheduleStore';

interface ClassroomCardProps {
    classroom: Classroom;
    isSelected?: boolean;
    onSelect: (id: string) => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
                                                         classroom,
                                                         isSelected,
                                                         onSelect
                                                     }) => {
    return (
        <div
            className={`
                w-full bg-white rounded-3xl p-5 transition-all duration-200 border-2 flex flex-col gap-4
                ${isSelected
                ? 'border-yellow-400 shadow-md bg-yellow-50'
                : 'border-transparent shadow-sm hover:border-yellow-200'
            }
            `}
        >
            <div className="flex w-full justify-between items-start">
                <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-black">{classroom.name}</p>
                    <p className="text-sm font-medium text-gray-400">
                        Вместимость: <span className="text-black">{classroom.capacity} чел.</span>
                    </p>
                </div>
                <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center font-bold transition-colors
                    ${isSelected ? 'bg-yellow-400 text-black' : 'bg-yellow-100 text-yellow-600'}
                `}>
                    A
                </div>
            </div>

            <button
                onClick={() => onSelect(classroom.id)}
                className={`
                    w-full py-3 rounded-xl font-bold text-sm transition-all
                    ${isSelected
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-400 hover:text-black'
                }
                `}
            >
                {isSelected ? 'Выбрано' : 'Забронировать'}
            </button>
        </div>
    );
};

export default ClassroomCard;
