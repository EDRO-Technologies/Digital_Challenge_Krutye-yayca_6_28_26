import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import { ModeSearchingProvider } from "./features/ScheduleFilter/ModeSearchingContenxt.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ModeSearchingProvider>
            <RouterProvider router={router} />
        </ModeSearchingProvider>
    </StrictMode>,
);
