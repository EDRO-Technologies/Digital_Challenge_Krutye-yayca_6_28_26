import { useModeSearching } from "@/features/ScheduleFilter/ModeSearchingContenxt";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HeaderTimetable() {
    return (
        <div className="flex flex-row w-full">
            <ScheduleTabs />
        </div>
    );
}

export function ScheduleTabs() {
    const {setModeSearching} = useModeSearching();

    return (
        <div className="flex justify-start w-full py-10">
            <Tabs defaultValue="group" className="w-auto"
            onValueChange={setModeSearching}
            >
                <TabsList className="bg-transparent p-0 h-auto space-x-4">
                    {/* Кнопка "Группа" */}
                    <TabsTrigger
                        value="group"
                        className="
              rounded-full px-8 py-2.5 text-sm font-medium transition-all
              bg-gray-100 text-gray-700 
              data-[state=active]:bg-[#60cbe8] data-[state=active]:text-white data-[state=active]:shadow-none
              hover:bg-gray-200
            "
                    >
                        Группа
                    </TabsTrigger>

                    {/* Кнопка "Преподаватель" */}
                    <TabsTrigger
                        value="teacher"
                        className="
              rounded-full px-8 py-2.5 text-sm font-medium transition-all
              bg-gray-100 text-gray-700 
              data-[state=active]:bg-[#60cbe8] data-[state=active]:text-white data-[state=active]:shadow-none
              hover:bg-gray-200
            "
                    >
                        Преподаватель
                    </TabsTrigger>

                    {/* Кнопка "Кабинеты" */}
                    <TabsTrigger
                        value="cabinet"
                        className="
              rounded-full px-8 py-2.5 text-sm font-medium transition-all
              bg-gray-100 text-gray-700 
              data-[state=active]:bg-[#60cbe8] data-[state=active]:text-white data-[state=active]:shadow-none
              hover:bg-gray-200
            "
                    >
                        Кабинеты
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
