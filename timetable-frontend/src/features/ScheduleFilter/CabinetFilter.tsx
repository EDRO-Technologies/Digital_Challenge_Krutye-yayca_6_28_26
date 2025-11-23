import { useNavigate } from "react-router";
import { EntitySelector } from "./EntitySelector.tsx";

export default function CabinetFilter() {
    const navigate = useNavigate();

    return (
        <div>
            <EntitySelector
                mode="room"
                onSelect={(room) => {
                    navigate("/timetable/room/" + room.id);
                }}
            />
        </div>
    );
}
