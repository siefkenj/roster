import { api } from "../../api/admin-actions";
import { ExamToken } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { ensureUrlToken } from "../admin/utils";
import { modelDataSlice } from "./model-data";

// Actions
export const adminExamTokensThunks = {
    fetch: createAsyncThunkWithErrorNotifications(
        "exam_tokens/fetchAll",
        async (_: undefined, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const exam_tokens = await api.examTokens.fetch(url_token);
            return dispatch(modelDataSlice.actions.setExamTokens(exam_tokens));
        },
    ),
    upsert: createAsyncThunkWithErrorNotifications(
        "exam_tokens/upsert",
        async (exam_token: Partial<ExamToken>, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const newExamToken = await api.examTokens.upsert(
                url_token,
                exam_token,
            );
            return dispatch(
                modelDataSlice.actions.upsertExamToken(newExamToken),
            );
        },
    ),
    invalidate: createAsyncThunkWithErrorNotifications(
        "exam_tokens/invalidate",
        async (exam_token: ExamToken, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const newExamToken = await api.examTokens.invalidate(
                url_token,
                exam_token.id,
            );
            return dispatch(
                modelDataSlice.actions.upsertExamToken(newExamToken),
            );
        },
    ),
    delete: createAsyncThunkWithErrorNotifications(
        "exam_tokens/delete",
        async (exam_token: ExamToken, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const deletedExamToken = await api.examTokens.delete(
                url_token,
                exam_token.id,
            );
            return dispatch(
                modelDataSlice.actions.deleteExamToken(deletedExamToken),
            );
        },
    ),
};
