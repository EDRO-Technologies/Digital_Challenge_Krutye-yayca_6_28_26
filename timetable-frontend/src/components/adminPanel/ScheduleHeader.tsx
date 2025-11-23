import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    ChevronDown,
    Search,
    CalendarClock,
    LayoutGrid
} from 'lucide-react';
import { type ViewMode, useScheduleStore } from '@/store/useScheduleStore';

interface ScheduleHeaderProps {
    title: string;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onNavigate: (direction: 'prev' | 'next') => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
                                                                  title,
                                                                  viewMode,
                                                                  onViewModeChange,
                                                                  onNavigate,
                                                              }) => {
    const modes: ViewMode[] = ['day', 'week', 'month'];

    const groups = useScheduleStore(state => state.groups);
    const selectedGroupId = useScheduleStore(state => state.selectedGroupId);
    const selectGroup = useScheduleStore(state => state.selectGroup);
    const currentGroup = groups.find(g => g.id === selectedGroupId);

    const adminMode = useScheduleStore(state => state.adminMode);
    const setAdminMode = useScheduleStore(state => state.setAdminMode);

    const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
    const [groupSearchQuery, setGroupSearchQuery] = useState('');

    const filteredGroups = useMemo(() => {
        if (!groupSearchQuery.trim()) return groups;
        return groups.filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()));
    }, [groups, groupSearchQuery]);

    return (
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 sticky top-0 z-20 backdrop-blur-xl bg-white/80">
            <div className="flex items-center gap-6">

                {/* Переключатель режимов Админки */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setAdminMode('schedule')}
                        className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${adminMode === 'schedule'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }
                `}
                    >
                        <LayoutGrid size={16} />
                        Расписание
                    </button>
                    <button
                        onClick={() => setAdminMode('events')}
                        className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${adminMode === 'events'
                            ? 'bg-yellow-400 text-black shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }
                `}
                    >
                        <CalendarClock size={16} />
                        Мероприятия
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-200" />

                {/* Селектор Группы */}
                <div className="relative">
                    <button
                        onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
                        className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group border border-transparent hover:border-gray-200"
                    >
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform">
                            <Users size={16} />
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Группа</div>
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                {currentGroup?.name || 'Выберите группу'}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isGroupMenuOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </button>

                    {isGroupMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsGroupMenuOpen(false)}
                            />
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2 pb-2 mb-2 border-b border-gray-50 sticky top-0 bg-white z-10">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Поиск группы..."
                                            value={groupSearchQuery}
                                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                                            autoFocus
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 ring-black/5"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                                    {filteredGroups.length > 0 ? (
                                        filteredGroups.map(group => (
                                            <button
                                                key={group.id}
                                                onClick={() => {
                                                    selectGroup(group.id);
                                                    setIsGroupMenuOpen(false);
                                                    setGroupSearchQuery('');
                                                }}
                                                className={`
                            w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between
                            ${selectedGroupId === group.id
                                                    ? 'bg-black text-white shadow-md shadow-gray-300'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                                                }
                          `}
                                            >
                                                {group.name}
                                                {selectedGroupId === group.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                            Группа не найдена
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-gray-100" />

                {/* Навигация даты */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-50 rounded-xl p-1">
                        <button
                            onClick={() => onNavigate('prev')}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-black transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => onNavigate('next')}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-black transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-900 min-w-[140px] justify-center">
                        <Calendar size={16} className="text-gray-400" />
                        {title}
                    </div>
                </div>
            </div>

            {/* Переключатель ViewMode (День/Неделя/Месяц) */}
            <div className="flex bg-gray-50 p-1 rounded-xl">
                {modes.map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onViewModeChange(mode)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${viewMode === mode
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }
            `}
                    >
                        {[
                            { id: 'day', label: 'День' },
                            { id: 'week', label: 'Неделя' },
                            { id: 'month', label: 'Месяц' }
                        ].find(m => m.id === mode)?.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
