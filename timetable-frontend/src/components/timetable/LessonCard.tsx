import { ACCENT_COLOR } from "../../lib/consts.ts";
import { Badge } from "../ui/badge.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog.tsx";

import { format } from "date-fns";
import { User, MapPin, Clock } from "lucide-react";

export default function LessonCard({
    lesson,
    isCompact = false,
}: {
    lesson?: any;
    isCompact?: boolean;
}) {
    console.log(lesson)
    if (!lesson) {
        return (
            <div
                className={`h-full w-full bg-gray-50/50 rounded-xl flex items-center justify-center text-gray-200 font-bold text-4xl select-none ${
                    isCompact ? "min-h-[100px]" : ""
                }`}
            >
                {/* Пустая ячейка */}
            </div>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className="h-full w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200 flex flex-col justify-between group relative overflow-hidden"
                    style={{ borderLeft: `4px solid ${ACCENT_COLOR}` }}
                >
                    <div>
                        <h4 className="font-bold text-sm leading-tight line-clamp-2 text-gray-800 mb-1">
                            {lesson.subject_name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                            {lesson.speaker_name}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 h-5 bg-[#fff4cc] text-gray-700 hover:bg-[#ffeaaa]"
                        >
                            {lesson.start_time
                                ? format(new Date(lesson.start_time), "HH:mm")
                                : ""}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 h-5 border-gray-300 text-gray-600 bg-white group-hover:bg-[#60cbe8] group-hover:text-white group-hover:border-[#60cbe8] transition-colors"
                        >
                            {lesson.room_number}
                        </Badge>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] w-[95%] rounded-2xl">
                <DialogHeader className="pb-2 border-b mb-4">
                    <DialogTitle className="text-xl leading-snug pr-6 text-left">
                        {lesson.subject_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {/* Блок: Преподаватель */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-full mt-1">
                            <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Преподаватель
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                                {lesson.speaker_name}
                            </p>
                        </div>
                    </div>

                    {/* Блок: Аудитория */}
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-50 p-2 rounded-full mt-1">
                            <MapPin className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Аудитория
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                                {lesson.room_number}
                                <span className="font-normal text-gray-500 ml-1">
                                    ({lesson.room_building})
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Блок: Время */}
                    <div className="flex items-start gap-3">
                        <div className="bg-green-50 p-2 rounded-full mt-1">
                            <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Время занятия
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                    variant="secondary"
                                    className="text-sm px-2 py-0.5 bg-gray-100 text-gray-800"
                                >
                                    {format(
                                        new Date(lesson.start_time),
                                        "HH:mm",
                                    )}
                                </Badge>
                                <span className="text-gray-400">—</span>
                                <Badge
                                    variant="secondary"
                                    className="text-sm px-2 py-0.5 bg-gray-100 text-gray-800"
                                >
                                    {format(new Date(lesson.end_time), "HH:mm")}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
