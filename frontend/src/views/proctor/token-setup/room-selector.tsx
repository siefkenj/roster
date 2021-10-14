import React from "react";
import { Form, FormControl } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { modelDataSelectors } from "../../../features/model-data/model-data";
import {
    proctorSelectors,
    proctorSlice,
} from "../../../features/proctor/proctor-slice";

export function RoomSelector() {
    const activeRoom = useAppSelector(proctorSelectors.activeRoom);
    const rooms = useAppSelector(modelDataSelectors.rooms);
    const dispatch = useAppDispatch();

    return (
        <Form>
            <Form.Group className="mb-0">
                <FormControl
                    as="select"
                    value={activeRoom ? activeRoom.id : ""}
                    onChange={(e) => {
                        const roomId = +e.target.value;
                        dispatch(proctorSlice.actions.setActiveRoomId(roomId));
                    }}
                >
                    <option value="" disabled hidden>
                        Select Room
                    </option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name}
                        </option>
                    ))}
                </FormControl>
            </Form.Group>
        </Form>
    );
}
