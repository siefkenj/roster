import React from "react";
import {
    Alert,
    Button,
    FormControl,
    InputGroup,
    Spinner,
} from "react-bootstrap";
import {
    FaArrowCircleRight,
    FaExclamationTriangle,
    FaQuestionCircle,
} from "react-icons/fa";
import { useHistory } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { VSpace } from "../../../components/layout";
import {
    editableActiveUserSelector,
    fetchActiveUserThunk,
    upsertActiveUserThunk,
    userSlice,
} from "../../../features/active-user/user-slice";
import {
    proctorSelectors,
    proctorSlice,
    proctorThunks,
} from "../../../features/proctor/proctor-slice";
import { strip } from "../../../libs/utils";
import { RoomSelector } from "./room-selector";

/**
 * Verify your name and enter information about your current match token.
 *
 * @export
 */
export function TokenSetup() {
    const editableActiveUser = useAppSelector(editableActiveUserSelector);
    const editableShortToken = useAppSelector(
        proctorSelectors.editableShortToken
    );
    const examTokenStatus = useAppSelector(proctorSelectors.examTokenStatus);
    const examToken = useAppSelector(proctorSelectors.examToken);
    const activeRoom = useAppSelector(proctorSelectors.activeRoom);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [checkShortExamToken, setCheckShortExamToken] = React.useState(false);
    const [waiting, setWaiting] = React.useState(false);
    // We want to be able to check the status of `waiting` inside our effects,
    // but we don't want the waiting status to trigger the effects. So, we create
    // a waitingRef to wrap the waiting status.
    const waitingRef = React.useRef<boolean>();
    waitingRef.current = waiting;

    const readyToStartMatching =
        examTokenStatus === "valid" && activeRoom != null;

    React.useEffect(() => {
        (async () => {
            await dispatch(fetchActiveUserThunk());
        })();
    }, [dispatch]);

    React.useEffect(() => {
        // Short tokens are always length six; we don't want to make any
        // api calls until we're possibly a short token.
        if (
            (editableShortToken.length < 6 && !checkShortExamToken) ||
            waitingRef.current
        ) {
            return;
        }
        // If we have ever typed more than 6 characters, we should check the
        // short exam token on every keystroke. The checks are forced with this flag.
        setCheckShortExamToken(true);

        // Run necessary checks
        (async () => {
            await dispatch(proctorThunks.fetchExamToken(editableShortToken));
        })();
    }, [
        editableShortToken,
        dispatch,
        checkShortExamToken,
        setCheckShortExamToken,
    ]);

    React.useEffect(() => {
        if (
            examTokenStatus !== "valid" ||
            examToken == null ||
            waitingRef.current
        ) {
            return;
        }
        (async () => {
            await dispatch(proctorThunks.fetchRooms(examToken.token));
        })();
    }, [examTokenStatus, examToken, dispatch]);

    let spinner = waiting ? (
        <Spinner animation="border" size="sm" className="mr-2" />
    ) : null;

    if (!editableActiveUser) {
        return (
            <div>
                Error: you are not authenticated as a user. You must be
                authenticated as a user to access this app.
            </div>
        );
    }
    let tokenWarning: React.ReactNode | null = null;
    if (examTokenStatus === "invalid") {
        tokenWarning = (
            <Alert variant="warning">
                <FaExclamationTriangle
                    style={{ verticalAlign: "sub" }}
                    className="mr-2"
                />
                The token <b>{editableShortToken}</b> is either invalid or
                expired.
            </Alert>
        );
    }
    let tokenInfo: React.ReactNode | null = null;
    if (examTokenStatus === "unknown") {
        tokenInfo = (
            <Alert variant="info">
                <FaQuestionCircle
                    style={{ verticalAlign: "sub" }}
                    className="mr-2"
                />
                Please enter a valid token to continue.
            </Alert>
        );
    }
    let roomWarning: React.ReactNode | null = null;
    if (activeRoom == null) {
        roomWarning = (
            <Alert variant="info">
                <FaQuestionCircle
                    style={{ verticalAlign: "sub" }}
                    className="mr-2"
                />
                Please select your classroom.
            </Alert>
        );
    }
    let tokenActivateWarning: React.ReactNode | null = null;
    if (readyToStartMatching) {
        tokenActivateWarning = (
            <Alert variant="secondary">
                <FaExclamationTriangle
                    style={{ verticalAlign: "sub" }}
                    className="mr-2"
                />
                The token <b>{examToken?.token}</b> can only be used once and
                will be valid for three hours after activation.
            </Alert>
        );
    }

    return (
        <div className="proctor-token-setup-view">
            <h5>
                Logged in as (<code>{editableActiveUser.utorid}</code>)
            </h5>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id="name">Your Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    value={editableActiveUser.name || ""}
                    onChange={(e) => {
                        const newName = e.target.value;
                        dispatch(
                            userSlice.actions.setEditableActiveUserName(newName)
                        );
                    }}
                />
            </InputGroup>
            <h5>Enter one-time use token</h5>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id="name">Token</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    value={editableShortToken}
                    onChange={(e) => {
                        dispatch(
                            proctorSlice.actions.setEditableShortToken(
                                strip(e.target.value).toLowerCase()
                            )
                        );
                    }}
                />
            </InputGroup>
            {tokenInfo}
            {tokenWarning}
            {examTokenStatus === "valid" && (
                <React.Fragment>
                    <h5>Select Room</h5>
                    <RoomSelector />
                    {roomWarning}
                </React.Fragment>
            )}
            <VSpace />
            {tokenActivateWarning}
            <Button
                disabled={!readyToStartMatching}
                onClick={async () => {
                    if (!editableActiveUser || !readyToStartMatching) {
                        console.warn(
                            "Attempting to proceed, but the active_user/token/room requirements are not met. Aborting instead."
                        );
                        return;
                    }
                    try {
                        setWaiting(true);
                        await dispatch(
                            upsertActiveUserThunk(editableActiveUser)
                        );
                        await dispatch(proctorThunks.activateExamToken());
                        history.push("/proctor/match");
                    } finally {
                        setWaiting(false);
                    }
                }}
            >
                {spinner} Next{" "}
                <FaArrowCircleRight style={{ verticalAlign: "sub" }} />
            </Button>
        </div>
    );
}
