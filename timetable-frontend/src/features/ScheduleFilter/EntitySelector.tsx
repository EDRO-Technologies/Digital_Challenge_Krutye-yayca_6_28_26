import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Search,
    ChevronRight,
    School,
    Building,
    Users,
    GraduationCap,
    MapPin,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
    getAllBuildings,
    getRoomsByBuildingId,
} from "../../services/supabase/roomService.ts";
import { getAllTeachers } from "../../services/supabase/teacherService.ts";
import { getAllInstitutes } from "../../services/supabase/institutesService.ts";
import { getCoursesByInstituteId, getGroupsByInstituteIdAndCourse } from "../../services/supabase/groupsService.ts";

export type SelectorMode = "group" | "teacher" | "room";

interface EntitySelectorProps {
    mode: SelectorMode;
    onSelect: (finalEntity: any) => void;
}

type StepLevel = 0 | 1 | 2;

export function EntitySelector({ mode, onSelect }: EntitySelectorProps) {
    const [level, setLevel] = useState<StepLevel>(0);
    const [history, setHistory] = useState<any[]>([]); 

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setSearchQuery(""); 
            try {
                let data = [];

                //  ЛОГИКА ДЛЯ ГРУПП (Институт -> Курс -> Группа) 
                if (mode === "group") {
                    if (level === 0) {
                        data = await getAllInstitutes();
                    } else if (level === 1) {
                        const selectedInstitute = history[0];
                        const courseNumbers = await getCoursesByInstituteId(
                            selectedInstitute.id,
                        );

                        data = courseNumbers.map((cn) => ({
                            id: cn,
                            name: `${cn} курс`,
                            type: "course",
                        }));
                    } else if (level === 2) {
                        const selectedInstitute = history[0];
                        const selectedCourse = history[1];

                        data = await getGroupsByInstituteIdAndCourse(
                            selectedInstitute.id,
                            selectedCourse.id,
                        );
                    }
                }

                // === ЛОГИКА ДЛЯ КАБИНЕТОВ (Корпус -> Кабинет) ===
                else if (mode === "room") {
                    if (level === 0) {
                        data = await getAllBuildings();
                    } else if (level === 1) {
                        const building = history[0];
                        data = await getRoomsByBuildingId(building.id);
                    }
                }

                // === ЛОГИКА ДЛЯ ПРЕПОДАВАТЕЛЕЙ (Плоский список) ===
                else if (mode === "teacher") {
                    data = await getAllTeachers();
                }

                setItems(data);
            } catch (e) {
                console.error("Error loading data:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [mode, level, history]);


    const handleSelect = (item: any) => {
        let isFinal = false;

        if (mode === "teacher") isFinal = true;
        if (mode === "room" && level === 1) isFinal = true;
        if (mode === "group" && level === 2) isFinal = true;

        if (isFinal) {
            onSelect(item);
        } else {
            setHistory([...history, item]);
            setLevel((prev) => (prev + 1) as StepLevel);
        }
    };

    const handleBack = () => {
        if (level > 0) {
            setHistory(history.slice(0, -1));
            setLevel((prev) => (prev - 1) as StepLevel);
        }
    };

    const filteredItems = items.filter((item) => {
        const name = item.name || item.full_name || item.room_number || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getTitle = () => {
        if (mode === "teacher") return "Поиск преподавателя";

        if (mode === "group") {
            if (level === 0) return "Выберите институт";
            if (level === 1) return "Выберите курс";
            if (level === 2) return "Выберите группу";
        }

        if (mode === "room") {
            if (level === 0) return "Выберите корпус";
            if (level === 1) return "Выберите аудиторию";
        }

        return "Выбор";
    };

    const getItemIcon = () => {
        if (mode === "teacher") return <Users className="h-4 w-4" />;
        if (mode === "room")
            return level === 0 ? (
                <Building className="h-4 w-4" />
            ) : (
                <MapPin className="h-4 w-4" />
            );

        if (level === 0) return <School className="h-4 w-4" />;
        if (level === 1) return <GraduationCap className="h-4 w-4" />;
        return <Users className="h-4 w-4" />;
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-muted">
            <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center gap-2">
                    {level > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="h-8 w-8 -ml-2 hover:bg-accent"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <CardTitle className="text-lg font-semibold">
                        {getTitle()}
                    </CardTitle>
                </div>

                {history.length > 0 && (
                    <div className="flex flex-wrap gap-1 animate-in fade-in zoom-in duration-300">
                        {history.map((h, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs px-2 py-0.5 text-muted-foreground font-normal"
                            >
                                {h.short_name || h.name || h.room_number}
                                {i < history.length - 1 && (
                                    <ChevronRight className="h-3 w-3 ml-1 inline" />
                                )}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск..."
                        className="pl-9 bg-muted/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
                <ScrollArea className="h-[320px] p-2">
                    {loading ? (
                        <div className="space-y-2 p-2">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="grid gap-1">
                            {filteredItems.map((item) => (
                                <Button
                                    key={item.id || item.room_number} 
                                    variant="ghost"
                                    className="justify-between h-auto py-3 px-4 font-normal text-left hover:bg-accent group"
                                    onClick={() => handleSelect(item)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {getItemIcon()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {item.name ||
                                                    item.full_name ||
                                                    item.room_number}
                                            </span>
                                            {(item.short_name ||
                                                item.address) && (
                                                <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                                                    {item.short_name ||
                                                        item.address}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!(
                                        mode === "teacher" ||
                                        (mode === "room" && level === 1) ||
                                        (mode === "group" && level === 2)
                                    ) && (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground text-center">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm font-medium">
                                Ничего не найдено
                            </p>
                            <p className="text-xs opacity-70">
                                Попробуйте изменить запрос
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
