import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { EntityList, EntityItem } from '@/components/adminPanel/EntityList';
import {
    getAllTeachersWithWorkload,
    createTeacherWithWorkload,
    updateTeacherWithWorkload,
    deleteTeacher,
} from '@/services/supabase/teacherService';
import { Plus, X, Loader2, Search } from 'lucide-react'; // Добавил иконку Search

// Типы данных
interface TeacherData {
    id: string;
    name: string;
    workload: {
        subject: string;
        hours: number;
        semester: number;
        year: number;
    }[];
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<TeacherData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Стейт для поиска
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        workloads: { subject: string; hours: string }[];
    }>({
        name: '',
        workloads: [{ subject: '', hours: '' }]
    });

    // --- ЗАГРУЗКА ДАННЫХ ---
    const loadTeachers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllTeachersWithWorkload();
            setTeachers(data as unknown as TeacherData[]);
        } catch (error) {
            console.error("Failed to load teachers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    // --- ФИЛЬТРАЦИЯ ---
    const filteredTeachers = useMemo(() => {
        if (!searchQuery.trim()) return teachers;

        const lowerQuery = searchQuery.toLowerCase();
        return teachers.filter(teacher =>
            teacher.name.toLowerCase().includes(lowerQuery) ||
            // Опционально: поиск по предметам тоже
            teacher.workload?.some(w => w.subject.toLowerCase().includes(lowerQuery))
        );
    }, [teachers, searchQuery]);

    // --- HANDLERS ---
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: '', workloads: [{ subject: '', hours: '' }] });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (teacher: TeacherData) => {
        setEditingId(teacher.id);
        setFormData({
            name: teacher.name,
            workloads: teacher.workload && teacher.workload.length > 0
                ? teacher.workload.map(w => ({
                    subject: w.subject,
                    hours: String(w.hours)
                }))
                : [{ subject: '', hours: '' }]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить преподавателя?')) return;
        try {
            await deleteTeacher(id);
            await loadTeachers();
        } catch (error: any) {
            alert('Ошибка удаления');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (!formData.name.trim()) throw new Error("Введите имя");
            const validWorkloads = formData.workloads.filter(w => w.subject.trim() && w.hours);

            const payload = {
                fullName: formData.name,
                workload: validWorkloads.map(w => ({
                    subjectName: w.subject,
                    hours: parseInt(w.hours, 10),
                    semester: 1,
                    year: 2025
                }))
            };

            if (editingId) {
                await updateTeacherWithWorkload(editingId, payload);
            } else {
                await createTeacherWithWorkload(payload);
            }

            await loadTeachers();
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleWorkloadChange = (index: number, field: 'subject' | 'hours', value: string) => {
        const newWorkloads = [...formData.workloads];
        newWorkloads[index] = { ...newWorkloads[index], [field]: value };
        setFormData({ ...formData, workloads: newWorkloads });
    };

    const addWorkloadField = () => {
        setFormData({ ...formData, workloads: [...formData.workloads, { subject: '', hours: '' }] });
    };

    const removeWorkloadField = (index: number) => {
        if (formData.workloads.length > 1) {
            setFormData({ ...formData, workloads: formData.workloads.filter((_, i) => i !== index) });
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-full h-[85vh] mx-auto flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск по фамилии или предмету..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-6 rounded-3xl bg-white border border-gray-100  outline-none focus:ring-2 ring-black/5 transition-all"
                    />
                </div>

                {/* Контейнер списка */}
                <div className="flex-1 min-h-0">
                    <EntityList
                        title="Преподаватели"
                        onAdd={handleOpenCreate}
                        isLoading={isLoading}
                    >
                        {filteredTeachers.length > 0 ? (
                            filteredTeachers.map(teacher => (
                                <EntityItem
                                    key={teacher.id}
                                    title={teacher.name}
                                    subtitle={teacher.workload
                                        ? teacher.workload.map(w => `${w.subject} (${w.hours}ч)`).join(', ')
                                        : 'Нет нагрузки'
                                    }
                                    onDelete={() => handleDelete(teacher.id)}
                                    onEdit={() => handleOpenEdit(teacher)}
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

                {/* Модальное окно */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-8 rounded-3xl w-full max-w-[500px] flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">
                                    {editingId ? 'Редактировать' : 'Новый преподаватель'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">ФИО</label>
                                    <input
                                        placeholder="Иванов Иван Иванович"
                                        className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10 font-medium"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-gray-500 ml-1">Нагрузка</label>
                                        <button
                                            type="button"
                                            onClick={addWorkloadField}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Добавить
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {formData.workloads.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    placeholder="Предмет"
                                                    className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10 text-sm font-medium"
                                                    value={item.subject}
                                                    onChange={(e) => handleWorkloadChange(index, 'subject', e.target.value)}
                                                />
                                                <input
                                                    placeholder="Часы"
                                                    type="number"
                                                    className="w-20 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-black/10 text-sm font-medium"
                                                    value={item.hours}
                                                    onChange={(e) => handleWorkloadChange(index, 'hours', e.target.value)}
                                                />
                                                {formData.workloads.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeWorkloadField(index)}
                                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors text-gray-600"
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
