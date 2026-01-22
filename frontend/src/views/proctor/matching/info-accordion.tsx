import React from "react";
import {
    Accordion,
    AccordionContext,
    Button,
    Card,
    Spinner,
    Table,
} from "react-bootstrap";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    proctorSelectors,
    proctorThunks,
} from "../../../features/proctor/proctor-slice";
import { activeUserSelector } from "../../../features/active-user/user-slice";

/**
 * An accordion component for displaying information relevant to proctoring.
 */
export function InfoAccordion() {
    const activeUser = useAppSelector(activeUserSelector);
    const activeRoom = useAppSelector(proctorSelectors.activeRoom);
    const dispatch = useAppDispatch();
    const examToken = useAppSelector(proctorSelectors.examToken);
    const activeRoomNumMatches = useAppSelector(
        proctorSelectors.activeRoomNumMatches,
    );
    // Track when we are fetching stats so we can display a spinner if needed
    const [workingStatus, setWorkingStatus] = React.useState({
        isFetching: false,
        fetchInitiatedAt: 0,
    });

    return (
        <Accordion className="matching-additional-info-accordion">
            {/* <Accordion.Item eventKey="0">
                <Card>
                    <Card.Header>
                        <CustomToggle eventKey="0">Instructions</CustomToggle>
                    </Card.Header>
                </Card>
                <Accordion.Body>
                    <ol>
                        <li>Select a student from the dropdown at the top.</li>
                        <li>
                            Enter the booklet number for the test the student is
                            writing.
                        </li>
                        <li>
                            (Optional) Enter any comments about this
                            student/booklet.
                        </li>
                        <li>Click "Match" to create the match.</li>
                    </ol>
                    <p>
                        If a student is already matched to a booklet, you must
                        first click "Unmatch" before creating a new match.
                    </p>
                </Accordion.Body>
            </Accordion.Item> */}
            <Accordion.Item eventKey="1">
                <Card>
                    <Card.Header>
                        <CustomToggle
                            eventKey="1"
                            onOpen={async () => {
                                if (!examToken) {
                                    return;
                                }
                                // When the stats page is open, we need to retrieve room info and info about all matches
                                console.log(
                                    "Fetching stats info because stats accordion opened",
                                );

                                const promises = [
                                    dispatch(proctorThunks.fetchRooms()),
                                    dispatch(
                                        proctorThunks.fetchAllBookletMatches(),
                                    ),
                                ];
                                setWorkingStatus({
                                    isFetching: true,
                                    fetchInitiatedAt: Date.now(),
                                });
                                try {
                                    await Promise.all(promises);
                                } finally {
                                    setWorkingStatus({
                                        isFetching: false,
                                        fetchInitiatedAt: 0,
                                    });
                                }
                            }}
                        >
                            Stats
                        </CustomToggle>
                    </Card.Header>
                </Card>
                <Accordion.Body>
                    <Table striped bordered size="sm" className="stats-table">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{activeUser?.name || "Unknown"}</td>
                            </tr>
                            <tr>
                                <td>Room</td>
                                <td>{activeRoom?.name || "Unknown"}</td>
                            </tr>
                            <tr>
                                <td>Total Matched in Room</td>
                                <td>
                                    {workingStatus.isFetching ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        (activeRoomNumMatches ?? "Unknown")
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
}

/**
 * Custom toggle for an accordion
 */
function CustomToggle({
    children,
    eventKey,
    onOpen: onOpen,
}: React.PropsWithChildren<{
    eventKey: string;
    onOpen?: (eventKey: string) => void;
}>) {
    const { activeEventKey } = React.useContext(AccordionContext);
    const decoratedOnClick = useAccordionButton(eventKey, (e) => {
        // The way it works, if the eventKey matches the activeEventKey, it is being closed
        const isOpening = activeEventKey !== eventKey;
        if (onOpen && isOpening) {
            onOpen(eventKey);
        }
    });

    return (
        <Button
            variant="light"
            className="text-muted info-expander"
            onClick={decoratedOnClick}
        >
            {children}
        </Button>
    );
}
