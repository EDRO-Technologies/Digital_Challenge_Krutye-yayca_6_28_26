import React, { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';

interface TeacherModalProps {
    selection: { date: Date, slotId?: number } | null;
    onClose: () => void;
    onSave: (teacherId: string, classroomId: string | null) => void;
    initialTeacherId?: string | null; // НОВЫЙ ПРОП
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
                                                              selection,
                                                              onClose,
                                                              onSave,
                                                              initialTeacherId // Принимаем ID
                                                          }) => {
    const teachers = useScheduleStore((state) => state.teachers);
    const classrooms = useScheduleStore((state) => state.classrooms);
    const checkTeacherConflict = useScheduleStore((state) => state.checkTeacherConflict);
    const checkClassroomConflict = useScheduleStore((state) => state.checkClassroomConflict);

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

    // Эффект для установки начального учителя при открытии
    useEffect(() => {
        if (initialTeacherId) {
            setSelectedTeacherId(initialTeacherId);
        } else {
            setSelectedTeacherId(null);
        }
        setSelectedClassroomId(null); // Сбрасываем аудиторию
    }, [initialTeacherId, selection]);

    if (!selection || !selection.slotId) return null;

    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
    const dateKey = `${formatDateKey(selection.date)}|${selection.slotId}`;

    const handleSave = () => {
        if (selectedTeacherId) {
            onSave(selectedTeacherId, selectedClassroomId);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-[3rem]">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-[600px] flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

                <h3 className="text-2xl font-bold mb-1">Назначение пары</h3>
                <p className="text-gray-400 text-sm mb-4">
                    {selection.date.toLocaleDateString('ru-RU')} • {selection.slotId} пара
                </p>

                <div className="flex gap-4 flex-1 overflow-hidden min-h-[300px]">

                    {/* 1. ПРЕПОДАВАТЕЛИ */}
                    <div className="flex-1 flex flex-col w-1/2">
                        <h4 className="font-bold mb-2 text-gray-700 sticky top-0 bg-white z-10">1. Преподаватель</h4>
                        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                            {teachers.map(teacher => {
                                const conflict = checkTeacherConflict(dateKey, teacher.id);
                                const isBusy = teacher.hoursLeft <= 0 || conflict !== null;
                                const isSelected = selectedTeacherId === teacher.id;

                                return (
                                    <button
                                        key={teacher.id}
                                        onClick={() => !isBusy && setSelectedTeacherId(teacher.id)}
                                        disabled={isBusy}
                                        className={`
                                            p-3 rounded-xl text-left border transition-all relative
                                            ${isSelected ? 'border-green-500 bg-green-50 ring-1 ring-green-500 z-10' : 'border-transparent bg-gray-50'}
                                            ${isBusy ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50/50'}
                                        `}
                                    >
                                        <div className="font-bold text-sm leading-tight">{teacher.name}</div>
                                        {conflict ? (
                                            <div className="text-[10px] text-red-500 font-bold">Занят: {conflict}</div>
                                        ) : (
                                            <div className="text-[10px] text-gray-500">{teacher.subject}</div>
                                        )}
                                        {isSelected && <div className="absolute top-2 right-2 text-green-600 text-xs">✔</div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. АУДИТОРИИ */}
                    <div className="flex-1 flex flex-col border-l pl-4 border-gray-100 w-1/2">
                        <h4 className="font-bold mb-2 text-gray-700 sticky top-0 bg-white z-10">2. Аудитория</h4>
                        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                            <button
                                onClick={() => setSelectedClassroomId(null)}
                                className={`p-3 rounded-xl text-left border shrink-0 ${selectedClassroomId === null ? 'border-black bg-gray-800 text-white' : 'bg-gray-50 border-transparent'}`}
                            >
                                <span className="text-sm font-bold">Без аудитории</span>
                            </button>

                            {classrooms.map(room => {
                                const conflict = checkClassroomConflict(dateKey, room.id);
                                const isBusy = conflict !== null;
                                const isSelected = selectedClassroomId === room.id;

                                return (
                                    <button
                                        key={room.id}
                                        onClick={() => !isBusy && setSelectedClassroomId(room.id)}
                                        disabled={isBusy}
                                        className={`
                                            p-3 rounded-xl text-left border transition-all
                                            ${isSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-transparent bg-gray-50'}
                                            ${isBusy ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50/50'}
                                        `}
                                    >
                                        <div className="font-bold text-sm">{room.name}</div>
                                        {conflict ? (
                                            <div className="text-[10px] text-red-500 font-bold">Занята: {conflict}</div>
                                        ) : (
                                            <div className="text-[10px] text-gray-500">{room.capacity} мест</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => onSave('clear', null)}
                        className="px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors"
                    >
                        Очистить слот
                    </button>
                    <div className="flex-1"></div>
                    <button
                        onClick={onClose}
                        className="px-6 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedTeacherId}
                        className={`px-8 py-4 rounded-2xl font-bold text-white transition-all ${selectedTeacherId ? 'bg-black hover:bg-gray-800 shadow-lg transform hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};
