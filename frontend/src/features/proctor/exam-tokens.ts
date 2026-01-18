import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { proctorApi } from "./api-actions";
import { proctorSlice } from "./proctor-slice";

// Actions
export const proctorExamTokenThunks = {
    fetchExamToken: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/fetch",
        async (shortToken: string, { dispatch }) => {
            try {
                const exam_token = await proctorApi.fetchExamToken(shortToken);
                dispatch(proctorSlice.actions.setExamToken(exam_token));
                dispatch(
                    proctorSlice.actions.setActiveRoomId(exam_token.room_id),
                );
                dispatch(proctorSlice.actions.setExamTokenStatus("valid"));
            } catch (e) {
                dispatch(proctorSlice.actions.setExamToken(null));
                dispatch(proctorSlice.actions.setExamTokenStatus("invalid"));
            }
        },
    ),
    fetchExamTokenByCookie: createAsyncThunkWithErrorNotifications(
        "proctor/exam_token/fetchByCookie",
        async (cookie: string, { dispatch }) => {
            const exam_token = await proctorApi.fetchExamTokenByCookie(cookie);
            dispatch(proctorSlice.actions.setExamToken(exam_token));
            dispatch(proctorSlice.actions.setActiveRoomId(exam_token.room_id));
            dispatch(proctorSlice.actions.setExamTokenStatus("active"));
        },
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
                activeRoomId,
            );
            dispatch(proctorSlice.actions.setExamToken(activatedExamToken));
            dispatch(proctorSlice.actions.setExamTokenStatus("active"));
        },
    ),
};
