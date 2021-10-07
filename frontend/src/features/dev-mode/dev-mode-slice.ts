import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RawUser } from "../../api/raw-types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { userSlice } from "../active-user/user-slice";
import { debugApi } from "./api-actions";

export interface DebugState {
    hide_dev_frame: boolean;
    users: RawUser[];
}
const initialState: DebugState = {
    hide_dev_frame: false,
    users: [],
};

// Actions
export const debugThunks = {
    fetchUsers: createAsyncThunkWithErrorNotifications(
        "debug/users/fetch",
        async (_: void, { dispatch }) => {
            const users = await debugApi.fetchUsers();
            return dispatch(debugSlice.actions.setUsers(users));
        }
    ),
    setActiveUser: createAsyncThunkWithErrorNotifications(
        "debug/active_user/set",
        async (user: RawUser, { dispatch, getState }) => {
            const state = getState() as RootState;
            const currentActiveUser = state.user.active_user;
            if (currentActiveUser && currentActiveUser.id === user.id) {
                return;
            }
            const activeUser = await debugApi.setActiveUser(user);
            dispatch(userSlice.actions.setActiveUser(activeUser));
        }
    ),
    upsertUser: createAsyncThunkWithErrorNotifications(
        "debug/users/upsert",
        async (user: RawUser, { dispatch }) => {
            const newUser = await debugApi.upsertUser(user);
            return dispatch(debugSlice.actions.upsertUser(newUser));
        }
    ),
};
export const debugSlice = createSlice({
    name: "debug",
    initialState,
    reducers: {
        setHideDevFrame: (state, action: PayloadAction<boolean>) => {
            state.hide_dev_frame = action.payload;
        },
        setUsers: (state, action: PayloadAction<RawUser[]>) => {
            state.users = action.payload;
        },
        upsertUser: (state, action: PayloadAction<RawUser>) => {
            const newUser = action.payload;
            const user = state.users.find((e) => e.id === newUser.id);
            if (user) {
                Object.assign(user, newUser);
            } else {
                state.users.push(newUser);
            }
        },
    },
});

// Selectors
export function hideDevModeSelector(state: RootState) {
    return state.debug.hide_dev_frame;
}
export const debugSelectors = {
    hideDevModeSelector,
    users(state: RootState) {
        return state.debug.users;
    },
};
