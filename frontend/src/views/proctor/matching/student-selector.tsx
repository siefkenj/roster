import React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    proctorSelectors,
    proctorThunks,
} from "../../../features/proctor/proctor-slice";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { Student } from "../../../api/types";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router";
import { modelDataSelectors } from "../../../features/model-data/model-data";

function formatStudentName(student: Student): string {
    return [student.first_name, student.last_name, `(${student.utorid})`]
        .filter((x) => x)
        .join(" ");
}

/**
 * Formats a student in a way that is suitable for react-bootstrap-typeahead
 *
 * @param {Student} student
 * @returns
 */
function studentToLabeledStudent(student: Student) {
    return {
        id: student.id,
        label: formatStudentName(student),
        email: student.email || "",
        utorid: student.utorid || "",
        student_number: student.student_number || "",
        matching_data: student.matching_data || "",
    };
}

/**
 * Match students to booklets.
 */
export function StudentSelectorInterface() {
    const fetchingStudents = useAppSelector(proctorSelectors.fetchingStudents);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const students = useAppSelector(modelDataSelectors.students);
    const activeStudent = useAppSelector(proctorSelectors.activeStudent);

    const labeledStudents = React.useMemo(
        () => students.map(studentToLabeledStudent),
        [students]
    );

    const selectedStudent = React.useMemo(
        () => (activeStudent ? [studentToLabeledStudent(activeStudent)] : []),
        [activeStudent]
    );

    const typeahead = (
        <Typeahead
            id="student-input"
            placeholder={
                fetchingStudents ? "Downloading Students..." : "Select Student"
            }
            ignoreDiacritics={true}
            caseSensitive={false}
            maxResults={7}
            paginate={true}
            multiple={true}
            filterBy={["email", "utorid", "student_number", "matching_data"]}
            options={labeledStudents}
            selected={selectedStudent}
            onChange={(selected) => {
                if (selected.length === 0) {
                    dispatch(
                        proctorThunks.setActiveStudentId({
                            activeStudentId: null,
                            history,
                        })
                    );
                } else {
                    const newlySelected = selected[selected.length - 1];
                    dispatch(
                        proctorThunks.setActiveStudentId({
                            activeStudentId: (newlySelected as any).id,
                            history,
                        })
                    );
                }
            }}
        />
    );

    return (
        <React.Fragment>
            {fetchingStudents ? (
                <div className="typeahead-container">
                    <div className="me-2">
                        <Spinner size="sm" animation="border" />
                    </div>
                    <div className="flex-grow-1">{typeahead}</div>
                </div>
            ) : (
                typeahead
            )}
        </React.Fragment>
    );
}
