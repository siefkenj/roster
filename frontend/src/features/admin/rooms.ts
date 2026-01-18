import { api } from "../../api/admin-actions";
import { Room } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { ensureUrlToken } from "./utils";
import { modelDataSlice } from "../model-data/model-data";

// Actions
export const adminRoomsThunks = {
    fetch: createAsyncThunkWithErrorNotifications(
        "rooms/fetchAll",
        async (_: undefined, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const rooms = await api.rooms.fetch(url_token);
            return dispatch(modelDataSlice.actions.setRooms(rooms));
        },
    ),
    upsert: createAsyncThunkWithErrorNotifications(
        "rooms/upsert",
        async (room: Partial<Room>, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const newRoom = await api.rooms.upsert(url_token, room);
            return dispatch(modelDataSlice.actions.upsertRoom(newRoom));
        },
    ),
    delete: createAsyncThunkWithErrorNotifications(
        "rooms/delete",
        async (room: Room, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const deletedRoom = await api.rooms.delete(url_token, room.id);
            return dispatch(modelDataSlice.actions.deleteRoom(deletedRoom));
        },
    ),
    uploadRoster: createAsyncThunkWithErrorNotifications(
        "rooms/uploadRoster",
        async (rooms: Room[], { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const newRooms = await api.rooms.uploadRoster(url_token, rooms);
            return dispatch(modelDataSlice.actions.setRooms(newRooms));
        },
    ),
};
