import React from "react";
import { Modal, Button, Alert, Spinner, Form } from "react-bootstrap";
import { strip } from "../../libs/utils";
import { Exam } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DialogRow } from "../forms/common-controls";
import {
    examSlice,
    examsSelector,
    upsertExamThunk,
} from "../../features/exam/exam-slice";

const BLANK_EXAM: Omit<Exam, "id" | "url_token"> = {
    name: "",
    end_time: "",
};

export function ExamEditor(props: { exam: Partial<Exam>; setExam: Function }) {
    const { exam: examProps, setExam } = props;
    const applicant = { ...BLANK_EXAM, ...examProps };

    /**
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr: keyof Exam) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = e.target.value || "";
            const newApplicant = { ...applicant, [attr]: newVal };
            setExam(newApplicant);
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
    function createFieldEditor(title: string, attr: keyof Exam, type = "text") {
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
                <DialogRow>{createFieldEditor("Exam Name", "name")}</DialogRow>
                <DialogRow>
                    {createFieldEditor("Exam Time", "end_time", "date")}
                </DialogRow>
            </Form.Row>
        </Form>
    );
}

/**
 * Find if there is a conflicting information with the proposed exam and existing exams.
 */
function getConflicts(exam: Partial<Exam>, exams: Exam[]) {
    const ret: {
        delayShow: string;
        immediateShow: React.ReactNode;
    } = { delayShow: "", immediateShow: "" };
    if (!strip(exam.name || "") || !strip(exam.end_time || "")) {
        ret.delayShow = "A name and end time is required";
    }
    const matchingExam = exams.find(
        (x) => strip(x.name) === strip(exam.name || "")
    );
    if (matchingExam) {
        ret.immediateShow = (
            <p>
                Another exam exists with name={exam.name}:{" "}
                <b>{matchingExam.name}</b>
            </p>
        );
    }
    return ret;
}

export function AddExamDialog(props: {
    show: boolean;
    onHide?: (...args: any) => any;
}) {
    const { show, onHide = () => {} } = props;
    const [newExam, setNewExam] = React.useState<Partial<Exam>>(BLANK_EXAM);
    const [inProgress, setInProgress] = React.useState(false);
    const exams = useAppSelector(examsSelector);
    const dispatch = useAppDispatch();

    function _upsertExam(exam: Partial<Exam>) {
        return dispatch(upsertExamThunk(exam));
    }

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewExam(BLANK_EXAM);
        }
    }, [show]);

    async function createExam() {
        setInProgress(true);
        const resp = await _upsertExam(newExam);
        dispatch(
            examSlice.actions.setActiveExam((resp as any).payload.payload)
        );
        console.log("uuu", resp);
        setInProgress(false);
        onHide();
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const conflicts = getConflicts(newExam, exams);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Exam</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ExamEditor exam={newExam} setExam={setNewExam} />
                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createExam}
                    title={conflicts.delayShow || "Create Exam"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    {spinner}Create Exam
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
