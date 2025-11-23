import { useNavigate } from "react-router";
import { EntitySelector } from "./EntitySelector.tsx";


export default function GroupFilter() {
    const navigate = useNavigate();

    return (
        <div>
            <EntitySelector mode="group" onSelect={(group) => {
                navigate("/timetable/group/" + group.id);
            }} />
        </div>
    )
}