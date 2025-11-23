import { supabase } from '@/lib/supabase';

export interface BackendRoom {
    id: string;
    room_number: string;
    building_id: number;
    building_name?: string;
    building_code?: string;
}

export interface BackendBuilding {
    id: number;
    name: string;
    code: string;
}

// GET - Все корпуса
export async function getAllBuildings(): Promise<BackendBuilding[]> {
    const { data, error } = await supabase
        .from('buildings')
        .select('id, name, code')
        .order('code', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getRoomById(room_id: number): Promise<BackendRoom> {
    const { data, error } = await supabase
        .from('rooms')
        .select(`
            id,
            room_number,
            building_id,
            buildings (
                name,
                code
            )
        `)
        .eq('id', room_id)
        .single();

    if (error) throw error;
    if (!data) throw new Error(`Room with id ${room_id} not found`);

    return {
        id: String(data.id),
        room_number: data.room_number,
        building_id: data.building_id,
        building_name: data.buildings?.name,
        building_code: data.buildings?.code
    };
}

export async function getRoomsByBuildingId(building_id: number): Promise<BackendRoom[]> {
    const { data, error } = await supabase
        .from('rooms')
        .select(`
            id,
            room_number,
            building_id,
            buildings (
                name,
                code
            )
        `)
        .eq('building_id', building_id)
        .order('room_number', { ascending: true });

    if (error) throw error;

    // Фильтрация, аналогичная getAllRooms, на случай битых данных,
    // хотя при фильтре по building_id это менее вероятно.
    const validRooms = data.filter((room: any) =>
        room.building_id !== null &&
        room.buildings !== null
    );

    return validRooms.map((room: any) => ({
        id: String(room.id),
        room_number: room.room_number,
        building_id: room.building_id,
        building_name: room.buildings?.name,
        building_code: room.buildings?.code
    }));
}

// GET - Все аудитории (фильтруем битые записи)
export async function getAllRooms(): Promise<BackendRoom[]> {
    const { data, error } = await supabase
        .from('rooms')
        .select(`
            id,
            room_number,
            building_id,
            buildings (
                name,
                code
            )
        `)
        .order('room_number', { ascending: true });

    if (error) throw error;

    // Фильтруем записи, где нет building_id или связи с buildings
    const validRooms = data.filter((room: any) =>
        room.building_id !== null &&
        room.buildings !== null
    );

    return validRooms.map((room: any) => ({
        id: String(room.id),
        room_number: room.room_number,
        building_id: room.building_id,
        building_name: room.buildings?.name,
        building_code: room.buildings?.code
    }));
}

// CREATE
export async function createRoom(payload: { roomNumber: string; buildingId: number }) {
    const { data, error } = await supabase
        .from('rooms')
        .insert({
            room_number: payload.roomNumber,
            building_id: payload.buildingId
        })
        .select()
        .single();

    if (error) throw error;
    return { success: true, roomId: data.id };
}

// UPDATE
export async function updateRoom(roomId: string, payload: { roomNumber: string; buildingId: number }) {
    const { error } = await supabase
        .from('rooms')
        .update({
            room_number: payload.roomNumber,
            building_id: payload.buildingId
        })
        .eq('id', roomId);

    if (error) throw error;
    return { success: true };
}

// DELETE
export async function deleteRoom(roomId: string) {
    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

    if (error) throw error;
    return { success: true };
}
