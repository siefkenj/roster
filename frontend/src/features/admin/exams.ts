import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/admin-actions";
import { Exam } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { modelDataSlice } from "../model-data/model-data";

export interface AdminState {
    active_exam: Exam | null;
}
const initialState: AdminState = {
    active_exam: null,
};

// Actions
export const adminExamThunks = {
    fetchAndSetActive: createAsyncThunkWithErrorNotifications(
        "exam/fetch",
        async (url_token: string, { dispatch }) => {
            const exam = await api.exams.fetchOne(url_token);
            dispatch(modelDataSlice.actions.upsertExam(exam));
            return dispatch(adminSlice.actions.setActiveExam(exam));
        }
    ),
    fetchOne: createAsyncThunkWithErrorNotifications(
        "exam/fetch",
        async (url_token: string, { dispatch }) => {
            const exam = await api.exams.fetchOne(url_token);
            return dispatch(modelDataSlice.actions.upsertExam(exam));
        }
    ),
    fetch: createAsyncThunkWithErrorNotifications(
        "exam/fetchAll",
        async (_: void, { dispatch }) => {
            const exams = await api.exams.fetch();
            return dispatch(modelDataSlice.actions.setExams(exams));
        }
    ),
    upsert: createAsyncThunkWithErrorNotifications(
        "exam/upsert",
        async (exam: Partial<Exam>, { dispatch }) => {
            const newExam = await api.exams.upsert(exam);
            await dispatch(adminExamThunks.upsertWithActiveExamCheck(newExam));
        }
    ),
    delete: createAsyncThunkWithErrorNotifications(
        "exam/delete",
        async (exam: Exam, { dispatch }) => {
            const deletedExam = await api.exams.delete(exam.url_token);
            await dispatch(
                adminExamThunks.deleteWithActiveExamCheck(deletedExam)
            );
        }
    ),
    /**
     * When an exam is upserted, if it happens to be the active exam, we want the active
     * exam to be updated as well.
     */
    upsertWithActiveExamCheck: createAsyncThunkWithErrorNotifications(
        "exam/upsertWithActiveExamCheck",
        async (exam: Exam, { dispatch, getState }) => {
            const state = getState() as RootState;
            dispatch(modelDataSlice.actions.upsertExam(exam));
            if (state.admin.active_exam?.url_token === exam.url_token) {
                dispatch(adminSlice.actions.setActiveExam(exam));
            }
        }
    ),
    /**
     * When an exam is deleted, if it happens to be the active exam, we want the active
     * exam to be deleted as well.
     */
    deleteWithActiveExamCheck: createAsyncThunkWithErrorNotifications(
        "exam/upsertWithActiveExamCheck",
        async (exam: Exam, { dispatch, getState }) => {
            const state = getState() as RootState;
            dispatch(modelDataSlice.actions.upsertExam(exam));
            if (state.admin.active_exam?.url_token === exam.url_token) {
                dispatch(adminSlice.actions.setActiveExam(null));
            }
        }
    ),
};

export const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setActiveExam: (state, action: PayloadAction<Exam | null>) => {
            state.active_exam = action.payload;
        },
    },
});

// Selectors
export const adminSelectors = {
    activeExam(state: RootState) {
        return state.admin.active_exam;
    },
};
