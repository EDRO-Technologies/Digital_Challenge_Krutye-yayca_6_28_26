import { Outlet } from "react-router";

export default function TimetableLayout() {
    return (
        <div className="w-[80vw] min-h-screen mx-auto">
            <Outlet />
        </div>
    );
}
