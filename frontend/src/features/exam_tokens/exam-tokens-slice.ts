import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    deleteExamToken,
    fetchExamTokens,
    invalidateExamToken,
    upsertExamToken,
} from "../../api/admin-actions";
import { ExamToken } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { activeExamSelector } from "../exam/exam-slice";

export interface ExamTokensState {
    exam_tokens: ExamToken[];
}
const initialState: ExamTokensState = {
    exam_tokens: [],
};

/**
 * Return the `url_token` of the active exam, otherwise throw an error.
 */
export function ensureUrlToken(state: RootState): string {
    const activeExam = activeExamSelector(state);
    if (!activeExam) {
        throw new Error("Cannot perform action without an `activeExam` set");
    }
    return activeExam.url_token;
}

// Actions
export const fetchExamTokensThunk = createAsyncThunkWithErrorNotifications(
    "exam_tokens/fetchAll",
    async (_: undefined, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const exam_tokens = await fetchExamTokens(url_token);
        return dispatch(examTokensSlice.actions.setExamTokens(exam_tokens));
    }
);
export const upsertExamTokenThunk = createAsyncThunkWithErrorNotifications(
    "exam_tokens/upsert",
    async (exam_token: Partial<ExamToken>, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const newExamToken = await upsertExamToken(url_token, exam_token);
        return dispatch(examTokensSlice.actions.upsertExamToken(newExamToken));
    }
);
export const invalidateExamTokenThunk = createAsyncThunkWithErrorNotifications(
    "exam_tokens/invalidate",
    async (exam_token: ExamToken, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const newExamToken = await invalidateExamToken(
            url_token,
            exam_token.id
        );
        return dispatch(examTokensSlice.actions.upsertExamToken(newExamToken));
    }
);
export const deleteExamTokenThunk = createAsyncThunkWithErrorNotifications(
    "exam_tokens/delete",
    async (exam_token: ExamToken, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const deletedExamToken = await deleteExamToken(
            url_token,
            exam_token.id
        );
        return dispatch(
            examTokensSlice.actions.deleteExamToken(deletedExamToken)
        );
    }
);

export const examTokensSlice = createSlice({
    name: "exam_tokens",
    initialState,
    reducers: {
        setExamTokens: (state, action: PayloadAction<ExamToken[]>) => {
            state.exam_tokens = action.payload;
        },
        upsertExamToken: (state, action: PayloadAction<ExamToken>) => {
            const exam_token = action.payload;
            const matchingExamToken = state.exam_tokens.find(
                (s) => s.id === exam_token.id
            );
            if (matchingExamToken) {
                Object.assign(matchingExamToken, exam_token);
            } else {
                state.exam_tokens.push(exam_token);
            }
        },
        deleteExamToken: (state, action: PayloadAction<ExamToken>) => {
            const exam_token = action.payload;
            const matchingExamTokenIndex = state.exam_tokens.findIndex(
                (s) => s.id === exam_token.id
            );
            if (matchingExamTokenIndex === -1) {
                throw new Error(
                    `Cannot find exam_token with id "${exam_token.id}" to delete`
                );
            }
            state.exam_tokens.splice(matchingExamTokenIndex, 1);
        },
    },
});

// Selectors
export function examTokensSelector(state: RootState) {
    return state.exam_tokens.exam_tokens;
}
