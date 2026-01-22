import React from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { FaChartBar, FaDownload, FaSync } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { exportThunks } from "../../../features/admin/export-thunks";
import { adminThunks } from "../../../features/admin/thunks";
import { MatchesTable } from "./matches-table";
import { modelDataSelectors } from "../../../features/model-data/model-data";

export function MatchesView() {
    const dispatch = useAppDispatch();
    const [roomStatsDialogVisible, setRoomStatsDialogVisible] =
        React.useState(false);
    const allMatches = useAppSelector(modelDataSelectors.flatBookletMatches);

    const matchesByRoom = React.useMemo(() => {
        const grouped: Record<string, typeof allMatches> = {};
        allMatches.forEach((match) => {
            const roomName = match.room_name || "Unknown";
            if (!grouped[roomName]) {
                grouped[roomName] = [];
            }
            grouped[roomName].push(match);
        });
        return grouped;
    }, [allMatches]);

    return (
        <React.Fragment>
            <div className="admin-tab-view-container">
                <div className="admin-tab-view-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            dispatch(adminThunks.bookletMatches.fetch());
                            dispatch(adminThunks.users.fetch());
                        }}
                    >
                        <FaSync className="me-2" />
                        Re-fetch Matches
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            dispatch(exportThunks.downloadBookletMatches());
                        }}
                    >
                        <FaDownload className="me-2" />
                        Export Matches
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                            dispatch(adminThunks.bookletMatches.fetch());
                            dispatch(adminThunks.users.fetch());
                            setRoomStatsDialogVisible(true);
                        }}
                    >
                        <FaChartBar className="me-2" />
                        Statistics by Room
                    </Button>
                </div>
                <div className="admin-tab-view-content">
                    <p>
                        View and export the booklet matches for your exam. If
                        you want to edit a booklet match (either to change or
                        delete it), you must do so in the proctor interface
                        using an exam token.
                    </p>
                    <MatchesTable />
                </div>
            </div>
            <Modal
                show={roomStatsDialogVisible}
                onHide={() => setRoomStatsDialogVisible(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Statistics by Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>Room Name</th>
                                <th>Number of Matches</th>
                                <th>TAs who Matched</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(matchesByRoom).map(
                                ([roomName, matches]) => (
                                    <tr key={roomName}>
                                        <td>{roomName}</td>
                                        <td>{matches.length}</td>
                                        <td>
                                            {Array.from(
                                                new Set(
                                                    matches.map(
                                                        (m) =>
                                                            m.user_name ||
                                                            "Unknown",
                                                    ),
                                                ),
                                            ).sort().join(", ")}
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setRoomStatsDialogVisible(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
