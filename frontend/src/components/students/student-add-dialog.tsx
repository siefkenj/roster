import React from "react";
import { Modal, Button, Alert, Spinner, Form } from "react-bootstrap";
import { strip } from "../../libs/utils";
import { Student } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DialogRow } from "../forms/common-controls";
import { modelDataSelectors } from "../../features/model-data/model-data";
import { adminThunks } from "../../features/admin/thunks";

const BLANK_STUDENT: Omit<Student, "id"> = {
    first_name: "",
    last_name: "",
    email: "",
    utorid: "",
    matching_data: "",
    student_number: "",
};

export function StudentEditor(props: {
    student: Partial<Student>;
    setStudent: Function;
}) {
    const { student: studentProps, setStudent } = props;
    const applicant = { ...BLANK_STUDENT, ...studentProps };

    /**
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr: keyof Student) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = e.target.value || "";
            const newApplicant = { ...applicant, [attr]: newVal };
            setStudent(newApplicant);
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
    function createFieldEditor(
        title: string,
        attr: keyof Student,
        type = "text"
    ) {
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
            <Form.Row>
                <DialogRow>
                    {createFieldEditor("First Name", "first_name")}
                    {createFieldEditor("Last Name", "last_name")}
                </DialogRow>
                <DialogRow>
                    {createFieldEditor("Email", "email")}
                    {createFieldEditor("UTORid", "utorid")}
                </DialogRow>
                <DialogRow>
                    {createFieldEditor("Student Number", "student_number")}
                    {createFieldEditor("Extra Data", "matching_data")}
                </DialogRow>
            </Form.Row>
        </Form>
    );
}

/**
 * Find if there is a conflicting information with the proposed student and existing students.
 */
function getConflicts(student: Partial<Student>, students: Student[]) {
    const ret: {
        delayShow: string;
        immediateShow: React.ReactNode;
    } = { delayShow: "", immediateShow: "" };
    if (
        !strip(student.utorid || "") ||
        !strip(student.first_name || "") ||
        !strip(student.last_name || "")
    ) {
        ret.delayShow = "A first name, last name, and utorid is required";
    }
    const matchingStudent = students.find(
        (x) => strip(x.utorid) === strip(student.utorid || "")
    );
    if (matchingStudent) {
        ret.immediateShow = (
            <p>
                Another student exists with utorid={student.utorid}:{" "}
                <b>
                    {matchingStudent.first_name} {matchingStudent.last_name}
                </b>
            </p>
        );
    }
    return ret;
}

export function AddStudentDialog(props: {
    show: boolean;
    onHide?: (...args: any) => any;
}) {
    const { show, onHide = () => {} } = props;
    const [newStudent, setNewStudent] = React.useState<Partial<Student>>(
        BLANK_STUDENT
    );
    const [inProgress, setInProgress] = React.useState(false);
    const students = useAppSelector(modelDataSelectors.students);
    const dispatch = useAppDispatch();

    function _upsertStudent(student: Partial<Student>) {
        return dispatch(adminThunks.students.upsert(student));
    }

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewStudent(BLANK_STUDENT);
        }
    }, [show]);

    async function createStudent() {
        setInProgress(true);
        await _upsertStudent(newStudent);
        setInProgress(false);
        onHide();
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const conflicts = getConflicts(newStudent, students);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Student</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <StudentEditor
                    student={newStudent}
                    setStudent={setNewStudent}
                />
                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createStudent}
                    title={conflicts.delayShow || "Create Student"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    {spinner}Create Student
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
