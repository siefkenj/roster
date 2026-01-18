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
        proctorSelectors.activeBookletMatch,
    );
    const activeStudent = useAppSelector(proctorSelectors.activeStudent);
    const editableBookletMatch = useAppSelector(
        proctorSelectors.editableBookletMatch,
    );

    return (
        <React.Fragment>
            <InputGroup title="A comment to be associated with this student/booklet.">
                <InputGroup.Text
                    id="name"
                    className="booklet-match-prepend-area"
                >
                    Comment
                </InputGroup.Text>
                <FormControl
                    disabled={!!activeBookletMatch || !activeStudent}
                    value={editableBookletMatch.comments || ""}
                    onChange={(e) => {
                        const comment = e.target.value;
                        dispatch(
                            proctorSlice.actions.setEditableBookletMatch({
                                comments: comment || null,
                            }),
                        );
                    }}
                />
            </InputGroup>
        </React.Fragment>
    );
}
