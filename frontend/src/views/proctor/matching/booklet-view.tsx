import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    proctorSelectors,
    proctorSlice,
} from "../../../features/proctor/proctor-slice";

/**
 * View/add/edit a booklet.
 */
export function BookletView() {
    const dispatch = useAppDispatch();
    const activeBookletMatch = useAppSelector(
        proctorSelectors.activeBookletMatch,
    );
    const activeStudent = useAppSelector(proctorSelectors.activeStudent);
    const editableBookletMatch = useAppSelector(
        proctorSelectors.editableBookletMatch,
    );

    return (
        <React.Fragment>
            <InputGroup title="The booklet number to be associated with the currently selected student.">
                <InputGroup.Text
                    id="name"
                    className="booklet-match-prepend-area"
                >
                    Booklet
                </InputGroup.Text>
                <FormControl
                    disabled={!!activeBookletMatch || !activeStudent}
                    value={editableBookletMatch.booklet}
                    inputMode="numeric"
                    onChange={(e) => {
                        const booklet = e.target.value;
                        dispatch(
                            proctorSlice.actions.setEditableBookletMatch({
                                booklet,
                            }),
                        );
                    }}
                />
            </InputGroup>
        </React.Fragment>
    );
}
