import React from "react";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import { FaDownload, FaPlus, FaSync, FaTrash } from "react-icons/fa";
import { useAppDispatch } from "../../../app/hooks";
import { ImportRoomsButton } from "../../../components/rooms/import-export";
import { AddRoomDialog } from "../../../components/rooms/room-add-dialog";
import { RoomsTable } from "../../../components/rooms/rooms-table";
import { exportThunks } from "../../../features/admin/export-thunks";
import { fetchRoomsThunk } from "../../../features/rooms/rooms-slice";

export function RoomsView() {
    const [inDeleteRoomsMode, setInDeleteRoomsMode] = React.useState(false);
    const [showAddRoomDialog, setShowAddRoomDialog] = React.useState(false);
    const dispatch = useAppDispatch();

    return (
        <React.Fragment>
            <div className="admin-tab-view-container">
                <div className="admin-tab-view-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            dispatch(fetchRoomsThunk());
                        }}
                    >
                        <FaSync className="mr-2" />
                        Re-fetch Rooms
                    </Button>
                    <Button
                        onClick={() => setShowAddRoomDialog(true)}
                        size="sm"
                    >
                        <FaPlus className="mr-2" />
                        Add Room
                    </Button>
                    <ButtonGroup toggle size="sm">
                        <ToggleButton
                            value="1"
                            type="checkbox"
                            checked={inDeleteRoomsMode}
                            onChange={(e) =>
                                setInDeleteRoomsMode(e.currentTarget.checked)
                            }
                        >
                            <FaTrash className="mr-2" />
                            Delete Rooms
                        </ToggleButton>
                    </ButtonGroup>
                    <ImportRoomsButton />
                    <Button
                        size="sm"
                        onClick={() => {
                            dispatch(exportThunks.downloadRooms());
                        }}
                    >
                        <FaDownload className="mr-2" />
                        Export Rooms
                    </Button>
                </div>
                <div className="admin-tab-view-content">
                    <p>
                        Set up the rooms for your exam. You may add rooms from a
                        pre-set list or upload them from a spreadsheet with a
                        single column labeled <i>Name</i>.
                    </p>
                    <RoomsTable inDeleteMode={inDeleteRoomsMode} />
                    <AddRoomDialog
                        show={showAddRoomDialog}
                        onHide={() => setShowAddRoomDialog(false)}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}
