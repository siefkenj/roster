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
        proctorSelectors.activeBookletMatch
    );
    const activeStudent = useAppSelector(proctorSelectors.activeStudent);
    const editableBookletMatch = useAppSelector(
        proctorSelectors.editableBookletMatch
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
                    inputMode="numeric"
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
