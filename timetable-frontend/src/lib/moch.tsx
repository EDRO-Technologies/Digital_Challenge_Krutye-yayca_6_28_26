export const institutes = [
    { id: 1, name: "Институт Информационных Технологий", short_name: "ИИТ" },
    { id: 2, name: "Институт Строительства и Архитектуры", short_name: "ИСА" },
    { id: 3, name: "Гуманитарный Институт", short_name: "ГИ" },
];

export const buildings = [
    { id: 1, name: "Главный корпус", code: "У", address: "ул. Ленина, 1" },
    {
        id: 2,
        name: "Лабораторный корпус",
        code: "Л",
        address: "ул. Гагарина, 5",
    },
    { id: 3, name: "Спортивный комплекс", code: "С", address: "ул. Мира, 10" },
];

export const roles = [
    { id: 1, name: "student" },
    { id: 2, name: "teacher" },
    { id: 3, name: "admin" },
];


export const scheduleStatuses = [
    { id: 1, name: "Запланировано", color: "#3b82f6" }, // blue
    { id: 2, name: "Отменено", color: "#ef4444" }, // red
    { id: 3, name: "Перенесено", color: "#f59e0b" }, // orange
];


export const rooms = Array.from({ length: 35 }, (_, i) => {
    const buildingId = (i % 3) + 1;
    const floor = Math.floor(Math.random() * 4) + 1; // Этаж 1-4
    const num = Math.floor(Math.random() * 90) + 10; // Номер 10-99
    return {
        id: i + 1,
        building_id: buildingId,
        room_number: `${floor}${num}`, // Пример: "405", "112"
    };
});

const subjectNames = [
    "Математический анализ",
    "Линейная алгебра",
    "Физика",
    "Информатика",
    "Программирование на Python",
    "Базы данных",
    "Операционные системы",
    "Философия",
    "Иностранный язык",
    "История",
    "Экономика",
    "Правоведение",
    "Дискретная математика",
    "Теория вероятностей",
    "Статистика",
    "Веб-разработка",
    "Алгоритмы и структуры данных",
    "Компьютерная графика",
    "Машинное обучение",
    "Искусственный интеллект",
    "Безопасность жизнедеятельности",
    "Физическая культура",
    "Социология",
    "Психология",
    "Русский язык и культура речи",
    "Менеджмент",
    "Маркетинг",
    "Бухгалтерский учет",
    "Электротехника",
    "Сопромат",
    "Теоретическая механика",
];

export const subjects = subjectNames.map((name, i) => ({
    id: i + 1,
    name: name,
}));

export const groups = Array.from({ length: 30 }, (_, i) => {
    const instituteId = (i % 3) + 1;
    const course = (i % 4) + 1; // Курс 1-4
    return {
        id: i + 1,
        name: `Группа-${100 * course + i}`, // Пример: "Группа-101", "Группа-205"
        course: course,
        institute_id: instituteId,
    };
});

export const users = [
    ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        full_name: `Преподаватель ${i + 1}`,
        role_id: 2, // Преподаватель
        email: `teacher${i + 1}@university.com`,
        phone_number: `+790000000${i < 10 ? "0" + i : i}`,
        group_id: null, // Преподам группа не нужна
        subgroup: null,
    })),

    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 16,
        full_name: `Студент ${i + 1}`,
        role_id: 1, // Студент
        email: `student${i + 1}@university.com`,
        phone_number: `+791100000${i < 10 ? "0" + i : i}`,
        group_id: (i % 30) + 1, // Раскидываем по группам
        subgroup: (i % 2) + 1, // 1 или 2
    })),
];

export const teacherSubjects = [];
for (let i = 0; i < 15; i++) {
    const teacherId = i + 1;
    teacherSubjects.push({
        teacher_id: teacherId,
        subject_id: (i % 30) + 1,
    });
    teacherSubjects.push({
        teacher_id: teacherId,
        subject_id: ((i + 15) % 30) + 1,
    });
}

export const scheduleItems = [];
const startDate = new Date(); // Сегодня
startDate.setHours(0, 0, 0, 0);

// Генерируем 40 записей (пар)
for (let i = 0; i < 40; i++) {
    // Случайный день (0..6 дней вперед)
    const dayOffset = i % 6;
    const pairNum = i % 4;

    // Время начала
    const start = new Date(startDate);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(8 + pairNum * 2, 30, 0); // Простая логика времени

    // Время конца (через 1.5 часа)
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 90);

    const teacherId = (i % 15) + 1;
    const groupId = (i % 30) + 1;

    const subjectRel = teacherSubjects.find(
        (ts) => ts.teacher_id === teacherId,
    );
    const subjectId = subjectRel ? subjectRel.subject_id : 1;

    scheduleItems.push({
        id: i + 1,
        subject_id: subjectId,
        speaker_id: teacherId,
        room_id: (i % 35) + 1, // Любая аудитория
        group_id: groupId,
        subgroup: null, // Вся группа
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        title: i % 3 === 0 ? "Лекция" : "Практика",
        description: "",
        is_lesson: true,
        status: 1, // Запланировано
    });
}
