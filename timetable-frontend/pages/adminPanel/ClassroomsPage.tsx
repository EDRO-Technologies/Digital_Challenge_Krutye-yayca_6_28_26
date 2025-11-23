import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { EntityList, EntityItem } from '@/components/adminPanel/EntityList';
import { getAllRooms, getAllBuildings, createRoom, updateRoom, deleteRoom, type BackendRoom, type BackendBuilding } from '@/services/supabase/roomService';
import { X, Loader2, Search } from 'lucide-react';

export default function ClassroomsPage() {
    const [rooms, setRooms] = useState<BackendRoom[]>([]);
    const [buildings, setBuildings] = useState<BackendBuilding[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ roomNumber: '', buildingId: '' });

    // Загрузка данных
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [roomsData, buildingsData] = await Promise.all([
                getAllRooms(),
                getAllBuildings()
            ]);
            setRooms(roomsData);
            setBuildings(buildingsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Фильтрация
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const query = searchQuery.toLowerCase();
        return rooms.filter(r =>
            r.room_number.toLowerCase().includes(query) ||
            r.building_code?.toLowerCase().includes(query) ||
            r.building_name?.toLowerCase().includes(query)
        );
    }, [rooms, searchQuery]);

    // Handlers
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ roomNumber: '', buildingId: buildings.length > 0 ? String(buildings[0].id) : '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (room: BackendRoom) => {
        setEditingId(room.id);
        setFormData({
            roomNumber: room.room_number,
            buildingId: String(room.building_id)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить аудиторию?')) return;
        try {
            await deleteRoom(id);
            await loadData();
        } catch (error: any) {
            alert('Ошибка удаления');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (!formData.roomNumber.trim()) throw new Error('Введите номер аудитории');
            if (!formData.buildingId) throw new Error('Выберите корпус');

            const payload = {
                roomNumber: formData.roomNumber,
                buildingId: parseInt(formData.buildingId, 10)
            };

            if (editingId) {
                await updateRoom(editingId, payload);
            } else {
                await createRoom(payload);
            }

            await loadData();
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-full h-[85vh] mx-auto flex flex-col gap-4">
                {/* Поиск */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск по номеру или корпусу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-6 rounded-3xl bg-white border border-gray-100  outline-none focus:ring-2 ring-black/5 transition-all"
                    />
                </div>

                {/* Список */}
                <div className="flex-1 min-h-0">
                    <EntityList title="Аудитории" onAdd={handleOpenCreate} isLoading={isLoading}>
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map(room => (
                                <EntityItem
                                    key={room.id}
                                    title={`${room.building_code}-${room.room_number}`}
                                    subtitle={room.building_name || 'Неизвестный корпус'}
                                    onDelete={() => handleDelete(room.id)}
                                    onEdit={() => handleOpenEdit(room)}
                                />
                            ))
                        ) : (
                            !isLoading && (
                                <div className="text-center py-10 text-gray-400">
                                    {searchQuery ? 'Ничего не найдено' : 'Список пуст'}
                                </div>
                            )
                        )}
                    </EntityList>
                </div>

                {/* Модалка */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl w-[400px] flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">
                                    {editingId ? 'Редактировать аудиторию' : 'Новая аудитория'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                                    <X size={24} />
                                </button>
                            </div>

                            <input
                                placeholder="Номер аудитории (408, 504)"
                                className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10"
                                value={formData.roomNumber}
                                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                                autoFocus
                            />

                            <select
                                className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10 font-medium"
                                value={formData.buildingId}
                                onChange={e => setFormData({ ...formData, buildingId: e.target.value })}
                            >
                                <option value="">Выберите корпус</option>
                                {buildings.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.code} - {b.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-black text-white hover:bg-gray-800 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="animate-spin" size={18} />}
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
}
