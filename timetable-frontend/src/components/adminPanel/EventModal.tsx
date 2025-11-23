import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, Loader2 } from 'lucide-react';
import { useScheduleStore } from '@/store/useScheduleStore';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: EventFormData) => Promise<void>;
    initialData?: Partial<EventFormData>;
}

export interface EventFormData {
    title: string;
    description: string;
    roomId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
}

export const EventModal: React.FC<EventModalProps> = ({
                                                          isOpen,
                                                          onClose,
                                                          onSave,
                                                          initialData
                                                      }) => {
    const classrooms = useScheduleStore(state => state.classrooms);
    const [isSaving, setIsSaving] = useState(false);

    // Инициализация формы
    const [formData, setFormData] = useState<EventFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        roomId: initialData?.roomId || (classrooms.length > 0 ? classrooms[0].id : ''),
        date: initialData?.date || new Date().toISOString().split('T')[0],
        startTime: initialData?.startTime || '09:00',
        endTime: initialData?.endTime || '10:30',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Введите название мероприятия');
            return;
        }

        if (!formData.roomId) {
            alert('Выберите аудиторию');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error: any) {
            alert('Ошибка создания: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden"
            >
                {/* Заголовок */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-yellow-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Создать мероприятие</h3>
                            <p className="text-xs text-gray-500">Забронируйте аудиторию</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Форма */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Название */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <FileText size={16} />
                            Название мероприятия
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Например: Собрание студсовета"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-yellow-400 transition-all"
                            required
                        />
                    </div>

                    {/* Описание */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <FileText size={16} />
                            Описание (опционально)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Дополнительная информация..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-yellow-400 transition-all resize-none"
                        />
                    </div>

                    {/* Дата */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Calendar size={16} />
                            Дата
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-yellow-400 transition-all"
                            required
                        />
                    </div>

                    {/* Время начала и конца */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Clock size={16} />
                                Начало
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-yellow-400 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Clock size={16} />
                                Конец
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-yellow-400 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Аудитория */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <MapPin size={16} />
                            Аудитория
                        </label>
                        <select
                            value={formData.roomId}
                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-yellow-400 transition-all"
                            required
                        >
                            {classrooms.length > 0 ? (
                                classrooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.name}
                                    </option>
                                ))
                            ) : (
                                <option value="">Нет доступных аудиторий</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Создание...
                            </>
                        ) : (
                            'Создать'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
