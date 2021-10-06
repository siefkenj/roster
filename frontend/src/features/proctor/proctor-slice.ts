import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RawBookletMatch } from "../../api/raw-types";
import { ExamToken } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { bookletMatchesSlice } from "../booklet-matches/booklet-matches-slice";
import { roomsSlice } from "../rooms/rooms-slice";
import { studentsSlice } from "../students/student-slice";
import { proctorApi } from "./api-actions";

// This is only imported for its type
import { useHistory } from "react-router";
import { formatStudentName } from "../../views/proctor/matching/matching-interface";
import { info } from "react-notification-system-redux";

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

// Actions
export const proctorThunks = {
    fetchExamToken: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/fetch",
        async (shortToken: string, { dispatch }) => {
            try {
                const exam_token = await proctorApi.fetchExamToken(shortToken);
                dispatch(proctorSlice.actions.setExamToken(exam_token));
                dispatch(
                    proctorSlice.actions.setActiveRoomId(exam_token.room_id)
                );
                dispatch(proctorSlice.actions.setExamTokenStatus("valid"));
            } catch (e) {
                dispatch(proctorSlice.actions.setExamToken(null));
                dispatch(proctorSlice.actions.setExamTokenStatus("invalid"));
            }
        }
    ),
    fetchExamTokenByCookie: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/fetchByCookie",
        async (cookie: string, { dispatch }) => {
            const exam_token = await proctorApi.fetchExamTokenByCookie(cookie);
            dispatch(proctorSlice.actions.setExamToken(exam_token));
            dispatch(proctorSlice.actions.setActiveRoomId(exam_token.room_id));
            dispatch(proctorSlice.actions.setExamTokenStatus("active"));
        }
    ),
    fetchRooms: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/rooms/fetch",
        async (shortToken: string, { dispatch }) => {
            const rooms = await proctorApi.fetchRooms(shortToken);
            dispatch(roomsSlice.actions.setRooms(rooms));
        }
    ),
    activateExamToken: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/activate",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            const activeRoomId = state.proctor.active_room_id;
            if (examToken == null) {
                throw new Error("Trying to activate null exam token.");
            }
            const activatedExamToken = await proctorApi.activateExamToken(
                examToken.token,
                activeRoomId
            );
            dispatch(proctorSlice.actions.setExamToken(activatedExamToken));
            dispatch(proctorSlice.actions.setExamTokenStatus("active"));
        }
    ),
    fetchStudents: createAsyncThunkWithErrorNotifications(
        "proctor/fetchStudents",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            if (examToken == null || examToken.cookie == null) {
                throw new Error(
                    "Cannot fetch students without an active exam token."
                );
            }
            try {
                dispatch(proctorSlice.actions.setFetchingStudents(true));
                const students = await proctorApi.fetchStudents(
                    examToken.cookie
                );
                dispatch(studentsSlice.actions.setStudents(students));
            } catch (e) {
                throw e;
            } finally {
                dispatch(proctorSlice.actions.setFetchingStudents(false));
            }
        }
    ),
    fetchBookletMatchForStudent: createAsyncThunkWithErrorNotifications(
        "proctor/fetchBookletMatchForStudent",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            const studentId = state.proctor.active_student_id;
            const editableBookletMatch = state.proctor.editable_booklet_match;
            if (
                examToken == null ||
                examToken.cookie == null ||
                studentId == null
            ) {
                throw new Error(
                    "Cannot fetch booklet matches without an active exam token and student id."
                );
            }
            const newBookletMatch = await proctorApi.fetchBookletMatchForStudent(
                examToken.cookie,
                studentId
            );
            if (newBookletMatch != null) {
                dispatch(
                    bookletMatchesSlice.actions.upsertBookletMatch(
                        newBookletMatch
                    )
                );
                // Keep the editable booklet in sync with the actual booklet whenever
                // we re-download the actual booklet.
                if (newBookletMatch.booklet !== editableBookletMatch.booklet) {
                    dispatch(
                        proctorSlice.actions.setEditableBooklet(
                            newBookletMatch.booklet
                        )
                    );
                }
                if (
                    newBookletMatch.comments !== editableBookletMatch.comments
                ) {
                    dispatch(
                        proctorSlice.actions.setEditableBookletMatch({
                            comments: newBookletMatch.comments,
                        })
                    );
                }
            } else {
                // If a null booklet match was returned, it means there is no corresponding
                // booklet match on the backend. Delete any local booklet matches to keep
                // things in sync.
                dispatch(
                    bookletMatchesSlice.actions.removeBookletMatchesForStudentById(
                        studentId
                    )
                );
            }
        }
    ),
    deleteBookletMatchForStudent: createAsyncThunkWithErrorNotifications(
        "proctor/deleteBookletMatchForStudent",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            const activeBookletMatch = proctorSelector.activeBookletMatch(
                state
            );
            if (
                activeBookletMatch == null ||
                examToken == null ||
                examToken.cookie == null
            ) {
                throw new Error(
                    "Cannot delete a booklet match without an active booklet match and activated exam token."
                );
            }
            const removedBookletMatch = await proctorApi.deleteBookletMatch(
                examToken.cookie,
                activeBookletMatch.id
            );
            dispatch(
                bookletMatchesSlice.actions.deleteBookletMatches(
                    removedBookletMatch
                )
            );
        }
    ),
    createBookletMatchForStudent: createAsyncThunkWithErrorNotifications(
        "proctor/createBookletMatchForStudent",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            const activeStudent = proctorSelector.activeStudent(state);
            const editableBooklet = proctorSelector.editableBooklet(state);
            const editableBookletMatch = proctorSelector.editableBookletMatch(
                state
            );
            if (
                activeStudent == null ||
                examToken == null ||
                examToken.cookie == null
            ) {
                throw new Error(
                    "Cannot create a booklet match without an active booklet match and activated exam token."
                );
            }
            const newBookletMatch = await proctorApi.createBookletMatch(
                examToken.cookie,
                {
                    ...(editableBookletMatch || {}),
                    student_id: activeStudent.id,
                    booklet: editableBooklet,
                }
            );
            dispatch(
                bookletMatchesSlice.actions.upsertBookletMatch(newBookletMatch)
            );
        }
    ),
    createBookletMatchForStudentWithSuccessTransition: createAsyncThunkWithErrorNotifications(
        "proctor/createBookletMatchForStudentWithSuccessTransition",
        async (
            history: ReturnType<typeof useHistory>,
            { getState, dispatch }
        ) => {
            const resp = await dispatch(
                proctorThunks.createBookletMatchForStudent()
            );
            if (resp.meta.requestStatus === "rejected") {
                return;
            }
            const state = getState() as RootState;
            const activeStudent = proctorSelector.activeStudent(state);
            const activeBookletMatch = proctorSelector.activeBookletMatch(
                state
            );
            if (activeStudent) {
                dispatch(
                    info({
                        position: "tc",
                        autoDismiss: 3,
                        title: "Match Successful",
                        message: `${formatStudentName(
                            activeStudent
                        )} is matched to booklet ${
                            activeBookletMatch?.booklet
                        }`,
                    })
                );
            }
            await dispatch(
                proctorThunks.setActiveStudentId({
                    activeStudentId: null,
                    history,
                })
            );
        }
    ),
    /**
     * Sets `activeStudentId`, but also pushes that id to the url so the "back"
     * button can work.
     */
    setActiveStudentId: createAsyncThunkWithErrorNotifications(
        "proctor/deleteBookletMatchForStudent",
        async (
            {
                activeStudentId,
                history,
            }: {
                activeStudentId: number | null;
                history: ReturnType<typeof useHistory>;
            },
            { getState, dispatch }
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
                        `/proctor/match/cookie/${examToken.cookie}/students/${activeStudentId}`
                    );
                } else {
                    history.push(
                        `/proctor/match/cookie/${examToken.cookie}/students/${activeStudentId}`
                    );
                }
            }
        }
    ),
};

export const proctorSlice = createSlice({
    name: "proctor",
    initialState,
    reducers: {
        setExamToken: (state, action: PayloadAction<ExamToken | null>) => {
            state.exam_token = action.payload;
        },
        setEditableShortToken: (state, action: PayloadAction<string>) => {
            state.editable_short_token = action.payload;
        },
        setExamTokenStatus: (
            state,
            action: PayloadAction<ProctorSlice["exam_token_status"]>
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
            action: PayloadAction<Partial<EditableBookletMatch>>
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
export const proctorSelector = {
    examToken(state: RootState) {
        return state.proctor.exam_token;
    },
    editableShortToken(state: RootState) {
        return state.proctor.editable_short_token;
    },
    examTokenStatus(state: RootState) {
        return state.proctor.exam_token_status;
    },
    activeRoom(state: RootState) {
        return state.rooms.rooms.find(
            (room) => room.id === state.proctor.active_room_id
        );
    },
    fetchingStudents(state: RootState) {
        return state.proctor.fetching_students;
    },
    activeStudent(state: RootState) {
        return (
            state.students.students.find(
                (student) => student.id === state.proctor.active_student_id
            ) || null
        );
    },
    activeStudentId(state: RootState) {
        return state.proctor.active_student_id;
    },
    editableBooklet(state: RootState) {
        return state.proctor.editable_booklet_match.booklet;
    },
    editableBookletMatch(state: RootState) {
        return state.proctor.editable_booklet_match;
    },
    activeBookletMatch(state: RootState) {
        const activeStudent = proctorSelector.activeStudent(state);
        if (!activeStudent) {
            return null;
        }
        return (
            state.booklet_matches.booklet_matches.find(
                (booklet) => booklet.student_id === activeStudent.id
            ) || null
        );
    },
};
