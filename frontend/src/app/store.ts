import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { reducer as notifications } from "../components/react-notification-system-redux";
import { userSlice } from "../features/active-user/user-slice";
import { adminSlice } from "../features/admin/exams";
import { debugSlice } from "../features/dev-mode/dev-mode-slice";
import { modelDataSlice } from "../features/model-data/model-data";
import { proctorSlice } from "../features/proctor/proctor-slice";

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        proctor: proctorSlice.reducer,
        admin: adminSlice.reducer,
        model_data: modelDataSlice.reducer,
        debug: debugSlice.reducer,
        notifications: notifications,
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
