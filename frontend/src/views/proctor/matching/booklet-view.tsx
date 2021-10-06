import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    proctorSelector,
    proctorSlice,
} from "../../../features/proctor/proctor-slice";

/**
 * View/add/edit a booklet.
 */
export function BookletView() {
    const dispatch = useAppDispatch();
    const activeBookletMatch = useAppSelector(
        proctorSelector.activeBookletMatch
    );
    const activeStudent = useAppSelector(proctorSelector.activeStudent);
    const editableBookletMatch = useAppSelector(
        proctorSelector.editableBookletMatch
    );

    return (
        <React.Fragment>
            <InputGroup title="The booklet number to be associated with the currently selected student.">
                <InputGroup.Prepend className="booklet-match-prepend-area">
                    <InputGroup.Text id="name">Booklet</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    disabled={!!activeBookletMatch || !activeStudent}
                    value={editableBookletMatch.booklet}
                    onChange={(e) => {
                        const booklet = e.target.value;
                        dispatch(
                            proctorSlice.actions.setEditableBookletMatch({
                                booklet,
                            })
                        );
                    }}
                />
            </InputGroup>
        </React.Fragment>
    );
}
