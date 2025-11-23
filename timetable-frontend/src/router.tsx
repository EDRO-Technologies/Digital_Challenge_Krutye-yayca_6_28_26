import { createBrowserRouter, Navigate } from "react-router";
import MainPage from './../pages/timetable/mainPage.tsx';
import TimetableLayout from './components/timetable/TimetableLayout.tsx';
import AdminPanelPage from "../pages/adminPanel";
import SchedulePage from '../pages/timetable/SchedulePage.tsx';
import TeachersPage from "../pages/adminPanel/TeachersPage.tsx";
import GroupsPage from "../pages/adminPanel/GroupsPage.tsx";
import ClassroomsPage from "../pages/adminPanel/ClassroomsPage.tsx";
import EventsPage from "../pages/adminPanel/EventsPage.tsx";

// --- 1. Массив маршрутов для АДМИНКИ (admin/...) ---
const adminRoutes = [
    {
        path: "", // Это будет /admin
        element: <AdminPanelPage/>
    },
    {
        path: "teachers", // /admin/teachers
        element: <TeachersPage/>
    },
    {
        path: "groups", // /admin/groups
        element: <GroupsPage/>
    },
    {
        path: "classrooms", // /admin/classrooms
        element: <ClassroomsPage/>
    },
    {
        path: "events",
        element: <EventsPage/>
    }

    // Добавляй новые страницы админки сюда
];

// --- 2. Массив маршрутов для РАСПИСАНИЯ (timetable/...) ---
const timetableRoutes = [
    {
        path: "", // Это будет /timetable
        element: <MainPage />,
    },
    {
        path: ":mode/:id",
        element: <SchedulePage />
    }

    // Добавляй новые страницы для студентов сюда
];

// --- 3. Сборка общего роутера ---
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/timetable" replace />, // Редирект с корня на расписание
    },

    // Секция Админки
    {
        path: "/admin",
        // element: <AdminLayout />, // Общий лейаут (меню, сайдбар админа)
        children: adminRoutes, // Подключаем массив админки
    },


    // Секция Публичного сайта
    {
        path: "/timetable",
        element: <TimetableLayout />, // Общий лейаут (шапка, поиск)
        children: timetableRoutes, // Подключаем массив расписания
    },

    // Страница 404
    {
        path: "*",
        element: <div>404: Страница не найдена</div>,
    },
]);
