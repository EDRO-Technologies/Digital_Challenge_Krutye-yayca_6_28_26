import React, { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import ActionCard from "./ActionCard";
import ClassroomCard from "./ClassroomCard";
import { useScheduleStore } from "@/store/useScheduleStore";

interface ActionPanelProps {
    selectedClassroomId?: string | null;
    onSelectClassroom?: (id: string) => void;
    onCreateEventClick?: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
                                                     selectedClassroomId,
                                                     onSelectClassroom,
                                                     onCreateEventClick
                                                 }) => {
    const adminMode = useScheduleStore((state) => state.adminMode);

    const teachers = useScheduleStore((state) => state.teachers);
    const classrooms = useScheduleStore((state) => state.classrooms);
    const isLoading = useScheduleStore((state) => state.isLoading);

    const [searchQuery, setSearchQuery] = useState('');

    // Фильтрация для учителей
    const filteredTeachers = useMemo(() => {
        if (adminMode !== 'schedule') return [];

        let data = [...teachers];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.workload?.some(w => w.subject.toLowerCase().includes(query))
            );
        }

        return data.sort((a, b) => {
            const aHours = a.workload ? a.workload.reduce((s, i) => s + i.hours, 0) : a.hoursLeft;
            const bHours = b.workload ? b.workload.reduce((s, i) => s + i.hours, 0) : b.hoursLeft;
            if (aHours > 0 && bHours <= 0) return -1;
            if (aHours <= 0 && bHours > 0) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [teachers, searchQuery, adminMode]);

    // Фильтрация для аудиторий
    const filteredClassrooms = useMemo(() => {
        if (adminMode !== 'events') return [];

        let data = [...classrooms];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter(c => c.name.toLowerCase().includes(query));
        }
        return data;
    }, [classrooms, searchQuery, adminMode]);

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-lg w-80 overflow-x-hidden rounded-2xl">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {adminMode === 'schedule' ? 'Преподаватели' : 'Мероприятия'}
                    </h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        adminMode === 'events' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
             {adminMode === 'schedule' ? filteredTeachers.length : filteredClassrooms.length}
          </span>
                </div>

                {adminMode === 'events' && (
                    <button
                        onClick={onCreateEventClick}
                        className="w-full mb-4 flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Plus size={20} />
                        Создать событие
                    </button>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={adminMode === 'schedule' ? "Поиск преподавателя..." : "Поиск аудитории..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Загрузка...</div>
                ) : adminMode === 'schedule' ? (
                    filteredTeachers.flatMap((teacher) => {
                        if (teacher.workload && teacher.workload.length > 0) {
                            return teacher.workload.map((workItem) => {
                                const compositeId = `${teacher.id}::${workItem.subject}`;
                                return (
                                    <ActionCard
                                        key={compositeId}
                                        teacher={{
                                            ...teacher,
                                            id: compositeId,
                                            subject: workItem.subject,
                                            totalHours: workItem.hours,
                                            hoursLeft: workItem.hoursLeft
                                        }}
                                    />
                                );
                            });
                        } else {
                            return <ActionCard key={teacher.id} teacher={teacher} />;
                        }
                    })
                ) : (
                    <>
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider px-1 mb-2">
                            Свободные аудитории
                        </div>
                        {filteredClassrooms.map((room) => (
                            <ClassroomCard
                                key={room.id}
                                classroom={room}
                                isSelected={selectedClassroomId === room.id}
                                onClick={(id) => {
                                    if (onSelectClassroom) onSelectClassroom(id);
                                }}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default ActionPanel;
