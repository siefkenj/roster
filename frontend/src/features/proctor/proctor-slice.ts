import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RawBookletMatch } from "../../api/raw-types";
import { ExamToken } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { proctorApi } from "./api-actions";

// This is only imported for its type
import { useHistory } from "react-router";
import { modelDataSelectors, modelDataSlice } from "../model-data/model-data";
import { proctorBookletMatchThunks } from "./booklet-matches";
import { proctorExamTokenThunks } from "./exam-tokens";
import { createBasicReducers } from "../../libs/basic-reducers";

type EditableBookletMatch = Pick<RawBookletMatch, "booklet" | "comments">;
export interface ProctorSlice {
    exam_token: ExamToken | null;
    editable_short_token: string;
    exam_token_status: "valid" | "active" | "invalid" | "unknown";
    active_room_id: number | null;
    fetching_students: boolean;
    active_student_id: number | null;
    editable_booklet_match: EditableBookletMatch;
}
const initialState: ProctorSlice = {
    exam_token: null,
    editable_short_token: "",
    exam_token_status: "unknown",
    active_room_id: null,
    fetching_students: false,
    active_student_id: null,
    editable_booklet_match: { booklet: "", comments: null },
};

const basicReducers = createBasicReducers(initialState, {}, "proctor");

// Actions
export const proctorThunks = {
    ...proctorBookletMatchThunks,
    ...proctorExamTokenThunks,
    fetchRooms: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/rooms/fetch",
        async (shortToken: string | undefined, { dispatch, getState }) => {
            const rooms = shortToken
                ? await proctorApi.fetchRooms(shortToken)
                : await proctorApi.fetchRoomsByCookie(
                      (getState() as RootState).proctor.exam_token?.cookie ||
                          "",
                  );
            dispatch(modelDataSlice.actions.setRooms(rooms));
        },
    ),
    fetchStudents: createAsyncThunkWithErrorNotifications(
        "proctor/fetchStudents",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            if (examToken == null || examToken.cookie == null) {
                throw new Error(
                    "Cannot fetch students without an active exam token.",
                );
            }
            try {
                dispatch(proctorSlice.actions.setFetchingStudents(true));
                const students = await proctorApi.fetchStudents(
                    examToken.cookie,
                );
                dispatch(modelDataSlice.actions.setStudents(students));
            } catch (e) {
                throw e;
            } finally {
                dispatch(proctorSlice.actions.setFetchingStudents(false));
            }
        },
    ),
    fetchAllBookletMatches: createAsyncThunkWithErrorNotifications(
        "proctor/fetchAllBookletMatches",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            if (examToken == null || examToken.cookie == null) {
                throw new Error(
                    "Cannot fetch booklet matches without an active exam token.",
                );
            }
            const matches = await proctorApi.fetchAllBookletMatches(
                examToken.cookie,
            );
            dispatch(modelDataSlice.actions.setBookletMatches(matches));
        },
    ),
    /**
     * Sets `activeStudentId`, but also pushes that id to the url so the "back"
     * button can work.
     */
    setActiveStudentId: createAsyncThunkWithErrorNotifications(
        "proctor/setActiveStudentId",
        async (
            {
                activeStudentId,
                history,
            }: {
                activeStudentId: number | null;
                history: ReturnType<typeof useHistory>;
            },
            { getState, dispatch },
        ) => {
            const state = getState() as RootState;
            const previousActiveStudentId = state.proctor.active_student_id;
            const examToken = state.proctor.exam_token;
            dispatch(proctorSlice.actions.setActiveStudentId(activeStudentId));
            // If we have an active exam token, we should set the URL appropriately.
            if (
                examToken?.cookie &&
                previousActiveStudentId !== activeStudentId
            ) {
                if (activeStudentId == null) {
                    history.push(`/proctor/match/cookie/${examToken.cookie}`);
                } else if (previousActiveStudentId == null) {
                    history.replace(
                        `/proctor/match/cookie/${examToken.cookie}/students/${activeStudentId}`,
                    );
                } else {
                    history.push(
                        `/proctor/match/cookie/${examToken.cookie}/students/${activeStudentId}`,
                    );
                }
            }
        },
    ),
};

export const proctorSlice = createSlice({
    name: "proctor",
    initialState,
    reducers: {
        ...basicReducers.reducers,
        setExamTokenStatus: (
            state,
            action: PayloadAction<ProctorSlice["exam_token_status"]>,
        ) => {
            state.exam_token_status = action.payload;
        },
        setActiveRoomId: (state, action: PayloadAction<number | null>) => {
            state.active_room_id = action.payload;
        },
        setFetchingStudents: (state, action: PayloadAction<boolean>) => {
            state.fetching_students = action.payload;
        },
        setActiveStudentId: (state, action: PayloadAction<number | null>) => {
            if (state.active_student_id !== action.payload) {
                state.active_student_id = action.payload;
                // We want to keep the editable booklet match and the active student
                // in sync. If there is a corresponding booklet match on the server, it will
                // be downloaded after this. Otherwise, we want the values cleared.
                proctorSlice.caseReducers.resetEditableBookletMatch(state);
            }
        },
        setEditableBooklet: (state, action: PayloadAction<string>) => {
            state.editable_booklet_match.booklet = action.payload;
        },
        setEditableBookletMatch: (
            state,
            action: PayloadAction<Partial<EditableBookletMatch>>,
        ) => {
            Object.assign(state.editable_booklet_match, action.payload);
        },
        resetEditableBookletMatch: (state) => {
            state.editable_booklet_match.booklet = "";
            state.editable_booklet_match.comments = null;
        },
    },
});

// Selectors
export const proctorSelectors = {
    ...basicReducers.selectors,
    activeRoom(state: RootState) {
        return modelDataSelectors
            .rooms(state)
            .find((room) => room.id === state.proctor.active_room_id);
    },
    activeRoomNumMatches(state: RootState) {
        const activeRoom = proctorSelectors.activeRoom(state);
        if (!activeRoom) {
            return undefined;
        }
        const bookletMatches = modelDataSelectors.bookletMatches(state);
        return bookletMatches.filter((match) => match.room_id === activeRoom.id)
            .length;
    },
    activeStudent(state: RootState) {
        const students = modelDataSelectors.students(state);
        return (
            students.find(
                (student) => student.id === state.proctor.active_student_id,
            ) || null
        );
    },
    editableBooklet(state: RootState) {
        return state.proctor.editable_booklet_match.booklet;
    },
    activeBookletMatch(state: RootState) {
        const activeStudent = proctorSelectors.activeStudent(state);
        if (!activeStudent) {
            return null;
        }
        return (
            modelDataSelectors
                .bookletMatches(state)
                .find((booklet) => booklet.student_id === activeStudent.id) ||
            null
        );
    },
};
