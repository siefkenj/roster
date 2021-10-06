import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { fetchActiveUser, upsertActiveUser } from "./actions";

export interface UserState {
    active_user: User | null;
    /**
     * Kept in sync with `active_user`, but fields can be temporarily mutated.
     */
    editable_active_user: User | null;
}
const initialState: UserState = {
    active_user: null,
    editable_active_user: null,
};

// Actions
export const fetchActiveUserThunk = createAsyncThunkWithErrorNotifications(
    "user/fetch",
    async (_, { dispatch }) => {
        const user = await fetchActiveUser();
        return dispatch(userSlice.actions.setActiveUser(user));
    }
);
export const upsertActiveUserThunk = createAsyncThunkWithErrorNotifications(
    "user/upsert",
    async (user: Partial<User>, { dispatch }) => {
        const newUser = await upsertActiveUser(user);
        return dispatch(userSlice.actions.upsertActiveUser(newUser));
    }
);

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setActiveUser: (state, action: PayloadAction<User | null>) => {
            state.active_user = action.payload;
            state.editable_active_user = state.active_user;
        },
        setEditableActiveUserName: (state, action: PayloadAction<string>) => {
            if (state.editable_active_user) {
                state.editable_active_user.name = action.payload;
            } else {
                console.warn(
                    "Trying to set the name of a `null` editable_active_user"
                );
            }
        },
        upsertActiveUser: (state, action: PayloadAction<User>) => {
            const newUser = action.payload;
            if (state.active_user == null) {
                state.active_user = newUser;
            } else {
                Object.assign(state.active_user, newUser);
            }
            state.editable_active_user = state.active_user;
        },
    },
});

// Selectors
export function activeUserSelector(state: RootState) {
    return state.user.active_user;
}
export function editableActiveUserSelector(state: RootState) {
    return state.user.editable_active_user;
}
