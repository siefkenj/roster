import React from "react";
import { Alert, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import { Redirect, useHistory, useRouteMatch } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { VSpace } from "../../../components/layout";
import {
    proctorSelectors,
    proctorSlice,
    proctorThunks,
} from "../../../features/proctor/proctor-slice";

/**
 * Catch if we have an active exam token, we want its cookie to be present in the URL. Similarly, if there is
 * a cookie in the URL, we want to make sure we're using the exam token corresponding to that cookie
 *
 * This is useful because <TokenSetup /> automatically fetches information about a token. If the token
 * is active, it will show warnings about an "already active" token, as the API doesn't allow a token
 * to be used twice.
 *
 * @export
 */
export function ActiveExamTokenWrapper({
    children,
    baseRoute,
}: React.PropsWithChildren<{ baseRoute: string }>) {
    const examTokenStatus = useAppSelector(proctorSelectors.examTokenStatus);
    const examToken = useAppSelector(proctorSelectors.examToken);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const match = useRouteMatch<{ cookie: string }>(
        `${baseRoute}/cookie/:cookie`
    );
    const matchedCookie = match?.params.cookie;
    React.useEffect(() => {
        if (matchedCookie && examToken?.cookie !== matchedCookie) {
            (async () => {
                await dispatch(
                    proctorThunks.fetchExamTokenByCookie(matchedCookie)
                );
            })();
        }
    }, [matchedCookie, examToken, dispatch]);

    if (
        match == null &&
        (examTokenStatus !== "active" ||
            examToken == null ||
            examToken.cookie == null)
    ) {
        return (
            <React.Fragment>
                <Alert variant="error" className="mb-2">
                    <FaExclamationTriangle
                        style={{ verticalAlign: "sub" }}
                        className="me-2"
                    />
                    You must enter a valid exam token to continue.
                </Alert>
                <VSpace />
                <Button
                    onClick={() => {
                        dispatch(
                            proctorSlice.actions.setEditableShortToken("")
                        );
                        dispatch(proctorSlice.actions.setExamToken(null));
                        history.push("/");
                    }}
                >
                    Enter a new Token
                </Button>
            </React.Fragment>
        );
    }

    // If we have an activated exam token, but the cookie is not set in the header,
    // set it in the header
    if (match == null && examToken != null) {
        return <Redirect to={`${baseRoute}/cookie/${examToken.cookie}`} />;
    }

    // If we have a cookie in the route, but the exam token is not currently loaded,
    // we need to refresh the token information.
    // We should never reach here, because the exam token should be automatically re-fetched
    // in an effect.
    if (match && examToken?.cookie !== match.params.cookie) {
        return <div>Error: Authentication cookies don't match</div>;
    }

    // All tests pass
    return <React.Fragment>{children}</React.Fragment>;
}
