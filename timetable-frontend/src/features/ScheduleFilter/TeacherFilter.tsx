import { useNavigate } from "react-router";
import { EntitySelector } from "./EntitySelector.tsx";

export default function TeacherFilter() {
    const navigate = useNavigate();

    return (
        <div>
            <EntitySelector
                mode="teacher"
                onSelect={(teacher) => {
                    navigate("/timetable/teacher/" + teacher.id);
                }}
            />
        </div>
    );
}
