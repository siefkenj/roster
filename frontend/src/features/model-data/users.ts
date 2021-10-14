import { api } from "../../api/admin-actions";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { ensureUrlToken } from "../admin/utils";
import { modelDataSlice } from "./model-data";

// Actions
export const adminUserThunks = {
    fetch: createAsyncThunkWithErrorNotifications(
        "users/fetch",
        async (_, { dispatch, getState }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const users = await api.users.fetch(url_token);
            return dispatch(modelDataSlice.actions.setUsers(users));
        }
    ),
};
