import { api } from "../../api/admin-actions";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { ensureUrlToken } from "../admin/utils";
import { modelDataSlice } from "./model-data";

// Actions
export const adminBookletMatchThunks = {
    fetch: createAsyncThunkWithErrorNotifications(
        "bookletMatches/fetch",
        async (_, { dispatch, getState }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const bookletMatches = await api.bookletMatches.fetch(url_token);
            return dispatch(
                modelDataSlice.actions.setBookletMatches(bookletMatches)
            );
        }
    ),
};
