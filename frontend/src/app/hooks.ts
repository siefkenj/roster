import { createAsyncThunk } from "@reduxjs/toolkit";
import { error } from "react-notification-system-redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Creates an async thunk that will automatically dispatch any errors via
 * `"react-notification-system-redux"`.
 */
export const createAsyncThunkWithErrorNotifications: typeof createAsyncThunk = (
    typePrefix,
    payloadCreator,
    options
) => {
    const wrappedPayloadCreator: typeof payloadCreator = async (...args) => {
        try {
            const ret = await payloadCreator(...args);
            return ret;
        } catch (e) {
            const { dispatch } = args[1];
            dispatch(
                error({
                    position: "tc",
                    autoDismiss: 10,
                    title: "API Error",
                    message: (e as Error).message,
                })
            );
            console.warn(e);
            throw e;
        }
    };
    return createAsyncThunk(typePrefix, wrappedPayloadCreator, options);
};
