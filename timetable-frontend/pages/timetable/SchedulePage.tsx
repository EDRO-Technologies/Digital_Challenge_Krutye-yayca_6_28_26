import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";

import type { ViewMode } from "@/type/SchedulePageTypes.ts";

import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

import { Button } from "@/components/ui/button";

import { ACCENT_COLOR, PAIRS } from "@/lib/consts.ts";

import LessonCard from "@/components/timetable/LessonCard.tsx";
import { getGroupById } from "../../src/services/supabase/groupsService.ts";
import {
    getScheduleByGroupId,
    getScheduleByRoomId,
    getScheduleByTeacherId,
} from "../../src/services/supabase/scheduleService.ts";
import { getTeacherById } from "../../src/services/supabase/teacherService.ts";
import { getRoomById } from "../../src/services/supabase/roomService.ts";

export default function SchedulePage() {
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [searchingItemName, setSearchingItemName] = useState("Загрузка...");
    const [schedule, setSchedule] = useState<any[]>([]);

    const { id: searchingItemId, mode } = useParams();

    useEffect(() => {
        const loadData = async () => {
            try {
                let lessons = [];

                if (mode == "group") {
                    const group = await getGroupById(searchingItemId);

                    setSearchingItemName(group.name);

                    lessons = await getScheduleByGroupId(searchingItemId);
                } else if (mode == "teacher") {
                    const teacher = await getTeacherById(searchingItemId);
                    setSearchingItemName(teacher.name);

                    lessons = await getScheduleByTeacherId(searchingItemId);
                } else if (mode == "room") {
                    const room = await getRoomById(searchingItemId);
                    setSearchingItemName(room.room_number);

                    lessons = await getScheduleByRoomId(searchingItemId);
                }

                setSchedule(lessons);
            } catch (e) {
                console.error(e);
                setSearchingItemName("Ошибка загрузки");
            }
        };
        loadData();
    }, [searchingItemId]);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 6 }).map((_, i) =>
        addDays(weekStart, i),
    );

    // Обработчики навигации
    const prevPeriod = () => {
        if (viewMode === "day") setCurrentDate((d) => addDays(d, -1));
        else setCurrentDate((d) => addDays(d, -7));
    };

    const nextPeriod = () => {
        if (viewMode === "day") setCurrentDate((d) => addDays(d, 1));
        else setCurrentDate((d) => addDays(d, 7));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="rounded-full px-6 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 gap-2"
                        onClick={() => navigate("/timetable")}
                    >
                        <Settings2 className="h-4 w-4" />
                        Поиск
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                            {mode == "group" && "Группа"}
                            {mode == "teacher" && "Преподаватель"}
                            {mode == "room" && "Кабинет"}
                        </span>
                        <h1 className="text-lg font-bold leading-none">
                            {searchingItemName}
                        </h1>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-full w-full md:w-auto">
                    <button
                        onClick={() => setViewMode("day")}
                        className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            viewMode === "day"
                                ? `bg-[${ACCENT_COLOR}] text-white shadow-sm`
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                        style={{
                            backgroundColor:
                                viewMode === "day"
                                    ? ACCENT_COLOR
                                    : "transparent",
                        }}
                    >
                        День
                    </button>
                    <button
                        onClick={() => setViewMode("week")}
                        className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            viewMode === "week"
                                ? `bg-[${ACCENT_COLOR}] text-white shadow-sm`
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                        style={{
                            backgroundColor:
                                viewMode === "week"
                                    ? ACCENT_COLOR
                                    : "transparent",
                        }}
                    >
                        Неделя
                    </button>
                </div>

                <div className="flex items-center gap-2 hidden md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevPeriod}
                        className="rounded-full hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextPeriod}
                        className="rounded-full hover:bg-gray-100"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Button>
                </div>
            </header>

            <div className="md:hidden bg-white border-b border-gray-100 p-2 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max px-2">
                    {weekDays.map((date, i) => {
                        const isSelected = isSameDay(date, currentDate);
                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    setCurrentDate(date);
                                    setViewMode("day");
                                }}
                                className={`
                                    flex flex-col items-center justify-center min-w-[3.5rem] py-2 rounded-xl transition-all
                                    ${
                                        isSelected
                                            ? "bg-[#323232] text-white shadow-lg scale-105"
                                            : "bg-white text-gray-500 border border-gray-100"
                                    }
                                `}
                            >
                                <span className="text-[10px] font-medium uppercase opacity-80">
                                    {format(date, "EEE", { locale: ru })}
                                </span>
                                <span className="text-lg font-bold">
                                    {format(date, "d")}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="flex-1 p-4 md:p-6 overflow-auto bg-white">
                {/*  VIEW: WEEK */}
                {viewMode === "week" && (
                    <div className="hidden md:grid grid-cols-6 gap-4 h-full min-w-[1000px]">
                        {weekDays.map((day, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-3">
                                <div
                                    className={`
                                    p-3 rounded-xl text-white flex justify-between items-center shadow-sm
                                    ${
                                        isSameDay(day, new Date())
                                            ? `bg-[${ACCENT_COLOR}]`
                                            : "bg-[#323232]"
                                    }
                                `}
                                    style={{
                                        backgroundColor: isSameDay(
                                            day,
                                            new Date(),
                                        )
                                            ? ACCENT_COLOR
                                            : "#323232",
                                    }}
                                >
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[10px] uppercase opacity-80 font-medium">
                                            {format(day, "EEEE", {
                                                locale: ru,
                                            })}
                                        </span>
                                        <span className="font-bold text-lg">
                                            {format(day, "d MMM", {
                                                locale: ru,
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 flex-1">
                                    {PAIRS.map((pair) => {
                                        const daysLessons = schedule.filter(
                                            (l) =>
                                                isSameDay(
                                                    new Date(l.start_time),
                                                    day,
                                                ),
                                        );

                                        const lessonForSlot =
                                            daysLessons[pair.num - 1];

                                        return (
                                            <div
                                                key={pair.num}
                                                className="h-[120px] relative"
                                            >
                                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-gray-50 select-none -z-10">
                                                    {pair.num}
                                                </span>
                                                <LessonCard
                                                    lesson={lessonForSlot}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VIEW: DAY */}
                {(viewMode === "day" || window.innerWidth < 768) && (
                    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20">
                        <div className="md:hidden text-center mb-2">
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">
                                {format(currentDate, "EEEE, d MMMM", {
                                    locale: ru,
                                })}
                            </h2>
                        </div>

                        <div className="text-center mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h2 className="text-3xl font-bold text-gray-800 capitalize">
                                {format(currentDate, "EEEE", { locale: ru })}
                            </h2>
                            <p className="text-lg text-gray-500 font-medium">
                                {format(currentDate, "d MMMM yyyy", {
                                    locale: ru,
                                })}
                            </p>
                        </div>

                        {PAIRS.map((pair) => {
                            const daysLessons = schedule.filter((l) =>
                                isSameDay(new Date(l.start_time), currentDate),
                            );
                            const lesson = daysLessons[pair.num - 1];

                            return (
                                <div
                                    key={pair.num}
                                    className="flex gap-4 relative"
                                >
                                    <div className="w-16 flex-shrink-0 flex flex-col items-center pt-1">
                                        <span className="text-4xl font-bold text-gray-200 leading-none mb-1">
                                            {pair.num}
                                        </span>
                                    </div>

                                    {/* Правая колонка: Карточка */}
                                    <div className="flex-1 min-h-[100px]">
                                        {lesson ? (
                                            <LessonCard
                                                lesson={lesson}
                                                isCompact
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center pl-4">
                                                <span className="text-gray-300 font-medium text-sm">
                                                    Нет пары
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {pair.num !== 6 && (
                                        <div className="absolute left-8 top-12 bottom-[-24px] w-[2px] bg-gray-100 -z-10" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
