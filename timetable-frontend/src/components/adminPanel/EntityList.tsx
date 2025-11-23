import React from 'react';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';

// Пропсы для контейнера списка
interface EntityListProps {
    title: string;
    onAdd: () => void;
    children: React.ReactNode;
    isLoading?: boolean;
}

// Контейнер списка
export const EntityList: React.FC<EntityListProps> = ({ title, onAdd, children, isLoading }) => {
    return (
        <div className="bg-white w-full h-full rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Шапка */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium shadow-lg shadow-gray-200 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Добавить</span>
                </button>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span>Загрузка...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

// Пропсы для элемента списка
interface EntityItemProps {
    title: string;
    subtitle?: string;
    onDelete: () => void;
    onEdit: () => void;
}

// Элемент списка
export const EntityItem: React.FC<EntityItemProps> = ({ title, subtitle, onDelete, onEdit }) => (
    <div className="group flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
        <div className="flex flex-col min-w-0 pr-4">
            <span className="font-bold text-lg text-gray-800 truncate">{title}</span>
            {subtitle && (
                <span className="text-sm text-gray-400 font-medium truncate mt-0.5">
                    {subtitle}
                </span>
            )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
            <button
                onClick={onEdit}
                className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-xl transition-colors shadow-sm border border-transparent hover:border-gray-200"
            >
                <Edit size={18} />
            </button>
            <button
                onClick={onDelete}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
                <Trash2 size={18} />
            </button>
        </div>
    </div>
);
