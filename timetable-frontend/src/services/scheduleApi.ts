const API_BASE = import.meta.env.VITE_BACKEND; // VITE_BACKEND=http://localhost:3003

export interface CreateSchedulePayload {
    subject_id: number;
    speaker_id: number;
    room_id: number;
    group_id: number;
    start_time: string; // ISO
    end_time: string;   // ISO
    title?: string;
}

export interface UpdateSchedulePayload {
    id: number;
    subject_id?: number;
    speaker_id?: number;
    room_id?: number;
    group_id?: number;
    start_time?: string;
    end_time?: string;
    title?: string;
    status?: number;
}

export async function updateScheduleLesson(id: number, payload: UpdateSchedulePayload) {
    const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`Failed to update lesson: ${res.status}`);
    }
    return res.json();
}
export async function createScheduleLesson(payload: CreateSchedulePayload) {
    const res = await fetch(`${API_BASE}/api/schedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to create schedule: ${res.status} ${text}`);
    }

    return res.json();
}
