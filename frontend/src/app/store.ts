import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { reducer as notifications } from "react-notification-system-redux";
import { userSlice } from "../features/active-user/user-slice";
import { bookletMatchesSlice } from "../features/booklet-matches/booklet-matches-slice";
import { examSlice } from "../features/exam/exam-slice";
import { examTokensSlice } from "../features/exam_tokens/exam-tokens-slice";
import { modelDataSlice } from "../features/model-data/model-data";
import { proctorSlice } from "../features/proctor/proctor-slice";
import { roomsSlice } from "../features/rooms/rooms-slice";
import { studentsSlice } from "../features/students/student-slice";

export const store = configureStore({
    reducer: {
        exam: examSlice.reducer,
        students: studentsSlice.reducer,
        rooms: roomsSlice.reducer,
        exam_tokens: examTokensSlice.reducer,
        user: userSlice.reducer,
        proctor: proctorSlice.reducer,
        booklet_matches: bookletMatchesSlice.reducer,
        model_data: modelDataSlice.reducer,
        notifications: notifications as any,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
