import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { EntityList, EntityItem } from '@/components/adminPanel/EntityList';
import { getAllGroups, createGroup, updateGroup, deleteGroup, type BackendGroup } from '@/services/supabase/groupsService';
import { X, Loader2, Search } from 'lucide-react';

export default function GroupsPage() {
    const [groups, setGroups] = useState<BackendGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: '', course: '1' });

    // Загрузка данных
    const loadGroups = async () => {
        setIsLoading(true);
        try {
            const data = await getAllGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to load groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, []);

    // Фильтрация
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groups;
        const query = searchQuery.toLowerCase();
        return groups.filter(g => g.name.toLowerCase().includes(query));
    }, [groups, searchQuery]);

    // Handlers
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: '', course: '1' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (group: BackendGroup) => {
        setEditingId(group.id);
        setFormData({ name: group.name, course: String(group.course) });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить группу?')) return;
        try {
            await deleteGroup(id);
            await loadGroups();
        } catch (error: any) {
            alert('Ошибка удаления');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (!formData.name.trim()) throw new Error('Введите название группы');

            const payload = {
                name: formData.name,
                course: parseInt(formData.course, 10)
            };

            if (editingId) {
                await updateGroup(editingId, payload);
            } else {
                await createGroup(payload);
            }

            await loadGroups();
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
                        placeholder="Поиск по названию группы..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-6 rounded-3xl bg-white border border-gray-100  outline-none focus:ring-2 ring-black/5 transition-all"
                    />
                </div>

                {/* Список */}
                <div className="flex-1 min-h-0">
                    <EntityList title="Группы" onAdd={handleOpenCreate} isLoading={isLoading}>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(group => (
                                <EntityItem
                                    key={group.id}
                                    title={group.name}
                                    subtitle={`Курс: ${group.course}`}
                                    onDelete={() => handleDelete(group.id)}
                                    onEdit={() => handleOpenEdit(group)}
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
                                    {editingId ? 'Редактировать группу' : 'Новая группа'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                                    <X size={24} />
                                </button>
                            </div>

                            <input
                                placeholder="Название (напр. 202-Б)"
                                className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                            />

                            <input
                                type="number"
                                placeholder="Курс (1-4)"
                                className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10"
                                value={formData.course}
                                onChange={e => setFormData({ ...formData, course: e.target.value })}
                                min="1"
                                max="6"
                            />

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
