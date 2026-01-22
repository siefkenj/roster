import { createAsyncThunk } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { error } from "../components/react-notification-system-redux";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Creates an async thunk that will automatically dispatch any errors via
 * `"react-notification-system-redux"`.
 */
// @ts-ignore
export const createAsyncThunkWithErrorNotifications: typeof createAsyncThunk = (
    typePrefix: any,
    payloadCreator: any,
    options: any,
) => {
    //const wrappedPayloadCreator: typeof payloadCreator = async (...args) => {
    const wrappedPayloadCreator: any = async (...args: any[]) => {
        try {
            const ret = await (payloadCreator as any)(...args);
            return ret;
        } catch (e) {
            const { dispatch } = args[1];
            dispatch(
                error({
                    position: "tc",
                    autoDismiss: 7,
                    title: "API Error",
                    message: (e as Error).message,
                }),
            );
            console.warn(e);
            throw e;
        }
    };
    return createAsyncThunk(typePrefix, wrappedPayloadCreator, options);
};
