import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { proctorApi } from "./api-actions";

// This is only imported for its type
import { useHistory } from "react-router";
import { formatStudentName } from "../../views/proctor/matching/matching-interface";
import { modelDataSlice } from "../model-data/model-data";
import { proctorSelectors, proctorSlice, proctorThunks } from "./proctor-slice";
import { info } from "../../components/react-notification-system-redux";

// Actions
export const proctorBookletMatchThunks = {
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
                    "Cannot fetch booklet matches without an active exam token and student id.",
                );
            }
            const newBookletMatch =
                await proctorApi.fetchBookletMatchForStudent(
                    examToken.cookie,
                    studentId,
                );
            if (newBookletMatch != null) {
                dispatch(
                    modelDataSlice.actions.upsertBookletMatch(newBookletMatch),
                );
                // Keep the editable booklet in sync with the actual booklet whenever
                // we re-download the actual booklet.
                if (newBookletMatch.booklet !== editableBookletMatch.booklet) {
                    dispatch(
                        proctorSlice.actions.setEditableBooklet(
                            newBookletMatch.booklet,
                        ),
                    );
                }
                if (
                    newBookletMatch.comments !== editableBookletMatch.comments
                ) {
                    dispatch(
                        proctorSlice.actions.setEditableBookletMatch({
                            comments: newBookletMatch.comments,
                        }),
                    );
                }
            } else {
                // If a null booklet match was returned, it means there is no corresponding
                // booklet match on the backend. Delete any local booklet matches to keep
                // things in sync.
                dispatch(
                    modelDataSlice.actions.removeBookletMatchesForStudentById(
                        studentId,
                    ),
                );
            }
        },
    ),
    deleteBookletMatchForStudent: createAsyncThunkWithErrorNotifications(
        "proctor/deleteBookletMatchForStudent",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            const activeBookletMatch =
                proctorSelectors.activeBookletMatch(state);
            if (
                activeBookletMatch == null ||
                examToken == null ||
                examToken.cookie == null
            ) {
                throw new Error(
                    "Cannot delete a booklet match without an active booklet match and activated exam token.",
                );
            }
            const removedBookletMatch = await proctorApi.deleteBookletMatch(
                examToken.cookie,
                activeBookletMatch.id,
            );
            dispatch(
                modelDataSlice.actions.deleteBookletMatch(removedBookletMatch),
            );
        },
    ),
    createBookletMatchForStudent: createAsyncThunkWithErrorNotifications(
        "proctor/createBookletMatchForStudent",
        async (_: void, { getState, dispatch }) => {
            const state = getState() as RootState;
            const examToken = state.proctor.exam_token;
            const activeStudent = proctorSelectors.activeStudent(state);
            const editableBooklet = proctorSelectors.editableBooklet(state);
            const editableBookletMatch =
                proctorSelectors.editableBookletMatch(state);
            if (
                activeStudent == null ||
                examToken == null ||
                examToken.cookie == null
            ) {
                throw new Error(
                    "Cannot create a booklet match without an active booklet match and activated exam token.",
                );
            }
            const newBookletMatch = await proctorApi.createBookletMatch(
                examToken.cookie,
                {
                    ...(editableBookletMatch || {}),
                    student_id: activeStudent.id,
                    booklet: editableBooklet,
                },
            );
            dispatch(
                modelDataSlice.actions.upsertBookletMatch(newBookletMatch),
            );
        },
    ),
    createBookletMatchForStudentWithSuccessTransition:
        createAsyncThunkWithErrorNotifications(
            "proctor/createBookletMatchForStudentWithSuccessTransition",
            async (
                history: ReturnType<typeof useHistory>,
                { getState, dispatch },
            ) => {
                const resp = await dispatch(
                    proctorThunks.createBookletMatchForStudent(),
                );
                if (resp.meta.requestStatus === "rejected") {
                    return;
                }
                const state = getState() as RootState;
                const activeStudent = proctorSelectors.activeStudent(state);
                const activeBookletMatch =
                    proctorSelectors.activeBookletMatch(state);
                if (activeStudent) {
                    dispatch(
                        info({
                            position: "tc",
                            autoDismiss: 2.5,
                            title: "Match Successful",
                            message: `${formatStudentName(
                                activeStudent,
                            )} is matched to booklet ${
                                activeBookletMatch?.booklet
                            }`,
                        }),
                    );
                }
                await dispatch(
                    proctorThunks.setActiveStudentId({
                        activeStudentId: null,
                        history,
                    }),
                );
            },
        ),
};
