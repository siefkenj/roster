import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    proctorSelectors,
    proctorSlice,
} from "../../../features/proctor/proctor-slice";

/**
 * View/add/edit a comment.
 */
export function CommentView() {
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
            <InputGroup title="A comment to be associated with this student/booklet.">
                <InputGroup.Prepend className="booklet-match-prepend-area">
                    <InputGroup.Text id="name">Comment</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    disabled={!!activeBookletMatch || !activeStudent}
                    value={editableBookletMatch.comments || ""}
                    onChange={(e) => {
                        const comment = e.target.value;
                        dispatch(
                            proctorSlice.actions.setEditableBookletMatch({
                                comments: comment || null,
                            })
                        );
                    }}
                />
            </InputGroup>
        </React.Fragment>
    );
}
