import React from "react";
import { Modal, Button, Alert, Spinner, Form } from "react-bootstrap";
import { strip } from "../../libs/utils";
import { Room } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DialogRow } from "../forms/common-controls";
import { modelDataSelectors } from "../../features/model-data/model-data";
import { adminThunks } from "../../features/admin/thunks";

const BLANK_ROOM: Omit<Room, "id"> = {
    name: "",
};

export function RoomEditor(props: { room: Partial<Room>; setRoom: Function }) {
    const { room: roomProps, setRoom } = props;
    const applicant = { ...BLANK_ROOM, ...roomProps };

    /**
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr: keyof Room) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = e.target.value || "";
            const newApplicant = { ...applicant, [attr]: newVal };
            setRoom(newApplicant);
        };
    }

    /**
     * Create a bootstrap form component that updates the specified attr
     * of `position`
     *
     * @param {string} title - Label text of the form control
     * @param {string} attr - attribute of `position` to be updated when this form control changes
     * @returns {node}
     */
    function createFieldEditor(title: string, attr: keyof Room, type = "text") {
        return (
            <React.Fragment>
                <Form.Label>{title}</Form.Label>
                <Form.Control
                    type={type}
                    value={applicant[attr] || ""}
                    onChange={setAttrFactory(attr)}
                />
            </React.Fragment>
        );
    }

    return (
        <Form>
            <DialogRow>{createFieldEditor("Room Name", "name")}</DialogRow>
        </Form>
    );
}

/**
 * Find if there is a conflicting information with the proposed room and existing rooms.
 */
function getConflicts(room: Partial<Room>, rooms: Room[]) {
    const ret: {
        delayShow: string;
        immediateShow: React.ReactNode;
    } = { delayShow: "", immediateShow: "" };
    if (!strip(room.name || "")) {
        ret.delayShow = "A name is required";
    }
    const matchingRoom = rooms.find(
        (x) => strip(x.name) === strip(room.name || ""),
    );
    if (matchingRoom) {
        ret.immediateShow = (
            <p>
                Another room exists with name={room.name}:{" "}
                <b>{matchingRoom.name}</b>
            </p>
        );
    }
    return ret;
}

export function AddRoomDialog(props: {
    show: boolean;
    onHide?: (...args: any) => any;
}) {
    const { show, onHide = () => {} } = props;
    const [newRoom, setNewRoom] = React.useState<Partial<Room>>(BLANK_ROOM);
    const [inProgress, setInProgress] = React.useState(false);
    const rooms = useAppSelector(modelDataSelectors.rooms);
    const dispatch = useAppDispatch();

    function _upsertRoom(applicant: Partial<Room>) {
        return dispatch(adminThunks.rooms.upsert(applicant));
    }

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewRoom(BLANK_ROOM);
        }
    }, [show]);

    async function createRoom() {
        setInProgress(true);
        await _upsertRoom(newRoom);
        setInProgress(false);
        onHide();
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;

    const conflicts = getConflicts(newRoom, rooms);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <RoomEditor room={newRoom} setRoom={setNewRoom} />
                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createRoom}
                    title={conflicts.delayShow || "Create Room"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    {spinner}Create Room
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
