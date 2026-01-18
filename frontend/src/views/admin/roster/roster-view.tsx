import React from "react";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import { FaDownload, FaPlus, FaSync, FaTrash } from "react-icons/fa";
import { useAppDispatch } from "../../../app/hooks";
import { ImportStudentsButton } from "../../../components/students/import-export";
import { AddStudentDialog } from "../../../components/students/student-add-dialog";
import { StudentsTable } from "../../../components/students/students-table";
import { exportThunks } from "../../../features/admin/export-thunks";
import { adminStudentThunks } from "../../../features/model-data/students";

export function RosterView() {
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
    const [showAddStudentDialog, setShowAddStudentDialog] =
        React.useState(false);
    const dispatch = useAppDispatch();

    return (
        <React.Fragment>
            <div className="admin-tab-view-container">
                <div className="admin-tab-view-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            dispatch(adminStudentThunks.fetch());
                        }}
                    >
                        <FaSync className="me-2" />
                        Re-fetch Students
                    </Button>
                    <Button
                        onClick={() => setShowAddStudentDialog(true)}
                        size="sm"
                    >
                        <FaPlus className="me-2" />
                        Add Student
                    </Button>
                    <ButtonGroup size="sm">
                        <ToggleButton
                            id="delete-mode-toggle"
                            value="1"
                            type="checkbox"
                            checked={inDeleteMode}
                            onChange={(e) =>
                                setInDeleteMode(e.currentTarget.checked)
                            }
                        >
                            <FaTrash className="me-2" />
                            Delete Students
                        </ToggleButton>
                    </ButtonGroup>
                    <ImportStudentsButton />
                    <Button
                        size="sm"
                        onClick={() => {
                            dispatch(exportThunks.downloadStudents());
                        }}
                    >
                        <FaDownload className="me-2" />
                        Export Students
                    </Button>
                </div>
                <div className="admin-tab-view-content">
                    <p>
                        Set up the students for your exam. You may upload a
                        spreadsheet with <i>First Name</i>, <i>Last Name</i>,{" "}
                        <i>UTORid</i>, <i>Student Number</i>, <i>Email</i>, and{" "}
                        <i>Matching Data</i> columns.
                    </p>
                    <StudentsTable inDeleteMode={inDeleteMode} />
                    <AddStudentDialog
                        show={showAddStudentDialog}
                        onHide={() => setShowAddStudentDialog(false)}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}
