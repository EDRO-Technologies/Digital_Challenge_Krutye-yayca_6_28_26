import { NavLink } from 'react-router'; // Используем NavLink для активных стилей

const Header = () => {
    // Общий стиль для всех ссылок
    const baseLinkClass = "px-6 py-4 rounded-full transition-all duration-300 font-medium";

    // Стиль для активной ссылки (белый фон, черный текст)
    const activeClass = "bg-black text-white";

    // Стиль для неактивной ссылки (прозрачный фон, белый текст, ховер)
    const inactiveClass = "text-black hover:bg-white/10 hover:opacity-60";
    // Или если ты хочешь как было раньше (hover -> белый фон):
    // const inactiveClass = "text-white hover:bg-white hover:text-black";

    return (
        <div className="w-full rounded-[2rem] bg-white h-24 max-w-[1688px] text-white flex justify-center items-center gap-2 px-4">
            {/* Расписание (Главная админки) */}
            <NavLink
                to="/admin"
                end // Важно: end означает, что стиль активен только при точном совпадении "/admin"
                className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
                Расписание
            </NavLink>

            {/* Сотрудники */}
            <NavLink
                to="/admin/teachers"
                className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
                Сотрудники
            </NavLink>

            {/* Группы */}
            <NavLink
                to="/admin/groups"
                className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
                Группы
            </NavLink>

            {/* Аудитории */}
            <NavLink
                to="/admin/classrooms"
                className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
                Аудитории
            </NavLink>
        </div>
    );
};

export default Header;
