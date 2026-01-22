import React, { act } from "react";
import {
    Accordion,
    AccordionContext,
    Alert,
    Button,
    Card,
    Spinner,
    Table,
    useAccordionButton,
} from "react-bootstrap";
import {
    FaArrowRight,
    FaExclamationTriangle,
    FaLock,
    FaUnlock,
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { VSpace } from "../../../components/layout";
import {
    activeUserSelector,
    fetchActiveUserThunk,
} from "../../../features/active-user/user-slice";
import {
    proctorSelectors,
    proctorSlice,
    proctorThunks,
} from "../../../features/proctor/proctor-slice";
import { Student } from "../../../api/types";
import { CommentView } from "./comment-view";
import { BookletView } from "./booklet-view";
import { StudentSelectorInterface } from "./student-selector";
import { useHistory } from "react-router";
import { InfoAccordion } from "./info-accordion";

export function formatStudentName(student: Student): string {
    return [student.first_name, student.last_name, `(${student.utorid})`]
        .filter((x) => x)
        .join(" ");
}

function formatDatetime(datetime: string) {
    let date = new Date(datetime);
    if (!date) {
        return "Unknown time";
    }
    return `${date.toLocaleTimeString("en-CA", {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
    })} (${date.toLocaleDateString("en-CA")})`;
}

/**
 * Match students to booklets.
 */
export function MatchingInterface() {
    const activeUser = useAppSelector(activeUserSelector);
    const activeRoom = useAppSelector(proctorSelectors.activeRoom);
    const dispatch = useAppDispatch();
    const activeStudent = useAppSelector(proctorSelectors.activeStudent);
    const activeBookletMatch = useAppSelector(
        proctorSelectors.activeBookletMatch,
    );
    const history = useHistory();
    const [waiting, setWaiting] = React.useState(false);
    // We want to be able to check the status of `waiting` inside our effects,
    // but we don't want the waiting status to trigger the effects. So, we create
    // a waitingRef to wrap the waiting status.
    const waitingRef = React.useRef<boolean>(false);
    waitingRef.current = waiting;

    const matchBookletCallback = React.useCallback(async () => {
        if (!activeUser) {
            console.warn(
                "Attempting to proceed, but the active_user/token/room requirements are not met. Aborting instead.",
            );
            return;
        }
        try {
            setWaiting(true);
            await dispatch(
                proctorThunks.createBookletMatchForStudentWithSuccessTransition(
                    history,
                ),
            );
        } finally {
            setWaiting(false);
        }
    }, [activeUser, history]);

    React.useEffect(() => {
        (async () => {
            await dispatch(fetchActiveUserThunk());
            await dispatch(proctorThunks.fetchStudents());
        })();
    }, [dispatch]);

    React.useEffect(() => {
        dispatch(proctorSlice.actions.setEditableBooklet(""));
        if (!activeStudent) {
            return;
        }
        (async () => {
            await dispatch(proctorThunks.fetchBookletMatchForStudent());
        })();
    }, [dispatch, activeStudent]);

    let spinner = waiting ? (
        <Spinner animation="border" size="sm" className="me-2" />
    ) : null;

    let alreadyMatchedWarning: React.ReactNode | null = null;
    if (activeBookletMatch && activeStudent) {
        alreadyMatchedWarning = (
            <Alert variant="warning">
                <h5>
                    <FaExclamationTriangle
                        style={{ verticalAlign: "sub" }}
                        className="me-2"
                    />
                    Existing Match
                </h5>
                <p>
                    <b>{formatStudentName(activeStudent)}</b> was matched to
                    booklet <b>{activeBookletMatch.booklet}</b> at{" "}
                    <b>{formatDatetime(activeBookletMatch.time_matched)}</b>.
                </p>
                <p>
                    To match this student to a different booklet, you must first{" "}
                    <i>unmatch</i> them and then <i>rematch</i> them.
                </p>
            </Alert>
        );
    }

    return (
        <React.Fragment>
            <div className="proctor-matching-view">
                <h5>Student</h5>
                <StudentSelectorInterface />
                <h5>Matching Info</h5>
                <BookletView onEnterCallback={matchBookletCallback} />
                <CommentView onEnterCallback={matchBookletCallback} />

                {alreadyMatchedWarning}
                <VSpace />
                <InfoAccordion />
                {activeBookletMatch && (
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            if (!activeUser) {
                                console.warn(
                                    "Attempting to proceed, but the active_user/token/room requirements are not met. Aborting instead.",
                                );
                                return;
                            }
                            try {
                                setWaiting(true);
                                await dispatch(
                                    proctorThunks.deleteBookletMatchForStudent(),
                                );
                            } finally {
                                setWaiting(false);
                            }
                        }}
                    >
                        {spinner} Unmatch{" "}
                        <FaUnlock style={{ verticalAlign: "sub" }} />
                    </Button>
                )}
                <div className="d-flex">
                    <Button
                        disabled={!!activeBookletMatch || !activeStudent}
                        className="flex-grow-1"
                        onClick={matchBookletCallback}
                    >
                        {spinner} Match{" "}
                        <FaLock style={{ verticalAlign: "sub" }} />
                    </Button>
                    {activeBookletMatch && (
                        <Button
                            disabled={!activeBookletMatch}
                            className="flex-grow-1 ms-2"
                            onClick={async () => {
                                await dispatch(
                                    proctorThunks.setActiveStudentId({
                                        activeStudentId: null,
                                        history,
                                    }),
                                );
                            }}
                        >
                            Next{" "}
                            <FaArrowRight style={{ verticalAlign: "sub" }} />
                        </Button>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}
