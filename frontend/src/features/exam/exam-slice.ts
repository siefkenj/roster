import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    deleteExam,
    fetchExam,
    fetchExams,
    upsertExam,
} from "../../api/admin-actions";
import { Exam } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";

export interface ExamState {
    active_exam: Exam | null;
    exams: Exam[];
}
const initialState: ExamState = {
    active_exam: null,
    exams: [],
};

// Actions
export const fetchExamAndSetActiveThunk = createAsyncThunkWithErrorNotifications(
    "exam/fetch",
    async (url_token: string, { dispatch }) => {
        const exam = await fetchExam(url_token);
        dispatch(examSlice.actions.upsertExam(exam));
        return dispatch(examSlice.actions.setActiveExam(exam));
    }
);
export const fetchExamThunk = createAsyncThunkWithErrorNotifications(
    "exam/fetch",
    async (url_token: string, { dispatch }) => {
        const exam = await fetchExam(url_token);
        return dispatch(examSlice.actions.upsertExam(exam));
    }
);
export const fetchExamsThunk = createAsyncThunkWithErrorNotifications(
    "exam/fetchAll",
    async (_: void, { dispatch }) => {
        const exams = await fetchExams();
        return dispatch(examSlice.actions.setExams(exams));
    }
);
export const upsertExamThunk = createAsyncThunkWithErrorNotifications(
    "exam/upsert",
    async (exam: Partial<Exam>, { dispatch }) => {
        const newExam = await upsertExam(exam);
        return dispatch(examSlice.actions.upsertExam(newExam));
    }
);
export const deleteExamThunk = createAsyncThunkWithErrorNotifications(
    "exam/delete",
    async (exam: Exam, { dispatch }) => {
        const deletedExam = await deleteExam(exam.url_token);
        return dispatch(examSlice.actions.deleteExam(deletedExam));
    }
);

export const examSlice = createSlice({
    name: "exam",
    initialState,
    reducers: {
        setActiveExam: (state, action: PayloadAction<Exam | null>) => {
            state.active_exam = action.payload;
        },
        setExams: (state, action: PayloadAction<Exam[]>) => {
            state.exams = action.payload;
        },
        upsertExam: (state, action: PayloadAction<Exam>) => {
            const newExam = action.payload;
            const exam = state.exams.find(
                (e) => e.url_token === newExam.url_token
            );
            if (exam) {
                Object.assign(exam, newExam);
            } else {
                state.exams.push(newExam);
            }
            if (state.active_exam?.url_token === newExam.url_token) {
                Object.assign(state.active_exam, newExam);
            }
        },
        deleteExam: (state, action: PayloadAction<Exam>) => {
            const exam = action.payload;
            const matchingRoomIndex = state.exams.findIndex(
                (s) => s.url_token === exam.url_token
            );
            if (matchingRoomIndex !== -1) {
                state.exams.splice(matchingRoomIndex, 1);
            }
            if (state.active_exam?.url_token === exam.url_token) {
                state.active_exam = null;
            }
        },
    },
});

// Selectors
export function activeExamSelector(state: RootState) {
    return state.exam.active_exam;
}
export function examsSelector(state: RootState) {
    return state.exam.exams;
}
