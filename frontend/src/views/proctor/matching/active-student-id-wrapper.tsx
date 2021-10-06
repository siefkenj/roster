import React from "react";
import { useHistory, useRouteMatch } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    proctorSelector,
    proctorSlice,
} from "../../../features/proctor/proctor-slice";

/**
 * Ensure that if there is an active student, the `activeStudentId` gets encoded in the URL.
 * The `activeStudentId` always takes precedence over the URL param. However, if `activeStudentId` is null,
 * then the URL param takes precedence.
 */
export function ActiveStudentIdWrapper({
    children,
    baseRoute,
}: React.PropsWithChildren<{ baseRoute: string }>) {
    const dispatch = useAppDispatch();
    const activeStudentId = useAppSelector(proctorSelector.activeStudentId);
    const history = useHistory();
    const fullMatch = useRouteMatch<{ student_id: string; cookie: string }>(
        `${baseRoute}/cookie/:cookie/students/:student_id`
    );
    const cookieMatch = useRouteMatch<{ cookie: string }>(
        `${baseRoute}/cookie/:cookie`
    );
    const matchedStudentId = fullMatch?.params.student_id;
    const matchedCookie = cookieMatch?.params.cookie;
    React.useEffect(() => {
        if (matchedCookie == null) {
            return;
        }
        if (matchedStudentId != null) {
            if (activeStudentId !== +matchedStudentId) {
                dispatch(
                    proctorSlice.actions.setActiveStudentId(+matchedStudentId)
                );
            }
        }
    }, [
        matchedStudentId,
        activeStudentId,
        baseRoute,
        history,
        matchedCookie,
        dispatch,
    ]);

    return <React.Fragment>{children}</React.Fragment>;
}
