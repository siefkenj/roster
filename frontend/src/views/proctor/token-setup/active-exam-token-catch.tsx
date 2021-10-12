import React from "react";
import { Alert, Button } from "react-bootstrap";
import { FaExclamationTriangle, FaUndo } from "react-icons/fa";
import { useHistory } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { VSpace } from "../../../components/layout";
import {
    proctorSelectors,
    proctorSlice,
} from "../../../features/proctor/proctor-slice";

/**
 * Catch if we have an active exam token in the Redux store and prevent the child component from rendering.
 * Otherwise, render the child.
 *
 * This is useful because <TokenSetup /> automatically fetches information about a token. If the token
 * is active, it will show warnings about an "already active" token, as the API doesn't allow a token
 * to be used twice.
 *
 * @export
 */
export function ActiveExamTokenCatch({
    children,
    routeUndoTo,
}: React.PropsWithChildren<{ routeUndoTo: string }>) {
    const examTokenStatus = useAppSelector(proctorSelectors.examTokenStatus);
    const examToken = useAppSelector(proctorSelectors.examToken);
    const history = useHistory();
    const dispatch = useAppDispatch();

    // If we end up on this page with an already activated token, we probably
    // hit the back button accidentally. In that case, we don't want to refetch everything
    // and invalidate the exam_token. So, offer the user a choice to go back or continue.
    if (examToken && examTokenStatus === "active") {
        return (
            <React.Fragment>
                <Alert variant="warning" className="mb-2">
                    <FaExclamationTriangle
                        style={{ verticalAlign: "sub" }}
                        className="mr-2"
                    />
                    You're attempting to re-activate the token{" "}
                    <b>{examToken.token}</b>. Did you hit the back button by
                    mistake?
                </Alert>
                <VSpace />
                <Button
                    className="mb-2"
                    variant="secondary"
                    onClick={() => {
                        history.push(routeUndoTo);
                    }}
                >
                    <FaUndo style={{ verticalAlign: "sub" }} className="mr-2" />
                    Go Back
                </Button>
                <Button
                    onClick={() => {
                        dispatch(
                            proctorSlice.actions.setEditableShortToken("")
                        );
                        dispatch(proctorSlice.actions.setExamToken(null));
                    }}
                >
                    Enter a new Token
                </Button>
            </React.Fragment>
        );
    }
    return <React.Fragment>{children}</React.Fragment>;
}
