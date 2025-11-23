import CabinetFilter from "./CabinetFilter.tsx";
import GroupFilter from "./GroupFilter.tsx";
import { useModeSearching } from "./ModeSearchingContenxt.tsx";
import TeacherFilter from "./TeacherFilter.tsx";

export default function ScheduleFilter() {
    const { modeSearching } = useModeSearching();

    return (
        <>
            {modeSearching == "group" && <GroupFilter />}
            {modeSearching == "teacher" && <TeacherFilter />}
            {modeSearching == "cabinet" && <CabinetFilter />}
        </>
    );
}
