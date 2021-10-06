import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    deleteRoom,
    fetchRooms,
    uploadRoomRoster,
    upsertRoom,
} from "../../api/admin-actions";
import { Room } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { activeExamSelector } from "../exam/exam-slice";

export interface RoomsState {
    rooms: Room[];
}
const initialState: RoomsState = {
    rooms: [],
};

/**
 * Return the `url_token` of the active exam, otherwise throw an error.
 */
function ensureUrlToken(state: RootState): string {
    const activeExam = activeExamSelector(state);
    if (!activeExam) {
        throw new Error("Cannot perform action without an `activeExam` set");
    }
    return activeExam.url_token;
}

// Actions
export const fetchRoomsThunk = createAsyncThunkWithErrorNotifications(
    "rooms/fetchAll",
    async (_: undefined, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const rooms = await fetchRooms(url_token);
        return dispatch(roomsSlice.actions.setRooms(rooms));
    }
);
export const upsertRoomThunk = createAsyncThunkWithErrorNotifications(
    "rooms/upsert",
    async (room: Partial<Room>, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const newRoom = await upsertRoom(url_token, room);
        return dispatch(roomsSlice.actions.upsertRoom(newRoom));
    }
);
export const deleteRoomThunk = createAsyncThunkWithErrorNotifications(
    "rooms/delete",
    async (room: Room, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const deletedRoom = await deleteRoom(url_token, room.id);
        return dispatch(roomsSlice.actions.deleteRoom(deletedRoom));
    }
);
export const uploadRoomRosterThunk = createAsyncThunkWithErrorNotifications(
    "rooms/uploadRoster",
    async (rooms: Room[], { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const newRooms = await uploadRoomRoster(url_token, rooms);
        return dispatch(roomsSlice.actions.setRooms(newRooms));
    }
);

export const roomsSlice = createSlice({
    name: "rooms",
    initialState,
    reducers: {
        setRooms: (state, action: PayloadAction<Room[]>) => {
            state.rooms = action.payload;
        },
        upsertRoom: (state, action: PayloadAction<Room>) => {
            const room = action.payload;
            const matchingRoom = state.rooms.find((s) => s.id === room.id);
            if (matchingRoom) {
                Object.assign(matchingRoom, room);
            } else {
                state.rooms.push(room);
            }
        },
        deleteRoom: (state, action: PayloadAction<Room>) => {
            const room = action.payload;
            const matchingRoomIndex = state.rooms.findIndex(
                (s) => s.id === room.id
            );
            if (matchingRoomIndex === -1) {
                throw new Error(
                    `Cannot find room with id "${room.id}" to delete`
                );
            }
            state.rooms.splice(matchingRoomIndex, 1);
        },
    },
});

// Selectors
export function roomsSelector(state: RootState) {
    return state.rooms.rooms;
}
