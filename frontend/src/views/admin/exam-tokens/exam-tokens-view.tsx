import React from "react";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import { FaDownload, FaHourglassEnd, FaPlus, FaSync } from "react-icons/fa";
import { useAppDispatch } from "../../../app/hooks";
import { exportThunks } from "../../../features/admin/export-thunks";
import { adminThunks } from "../../../features/admin/thunks";
import { ExamTokensTable } from "./exam-tokens-table";

export function ExamTokensView() {
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
    const dispatch = useAppDispatch();

    return (
        <React.Fragment>
            <div className="admin-tab-view-container">
                <div className="admin-tab-view-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            dispatch(adminThunks.examTokens.fetch());
                        }}
                    >
                        <FaSync className="mr-2" />
                        Re-fetch Tokens
                    </Button>
                    <Button
                        onClick={() => {
                            dispatch(adminThunks.examTokens.upsert({}));
                        }}
                        size="sm"
                    >
                        <FaPlus className="mr-2" />
                        New Token
                    </Button>
                    <ButtonGroup toggle size="sm">
                        <ToggleButton
                            value="1"
                            type="checkbox"
                            checked={inDeleteMode}
                            onChange={(e) =>
                                setInDeleteMode(e.currentTarget.checked)
                            }
                        >
                            <FaHourglassEnd className="mr-2" />
                            Expire Token
                        </ToggleButton>
                    </ButtonGroup>
                    <Button
                        size="sm"
                        onClick={() => {
                            dispatch(exportThunks.downloadExamTokens());
                        }}
                    >
                        <FaDownload className="mr-2" />
                        Export Tokens
                    </Button>
                </div>
                <div className="admin-tab-view-content">
                    <p>
                        Set up the students for your exam. You may upload a
                        spreadsheet with <i>First Name</i>, <i>Last Name</i>,{" "}
                        <i>UTORid</i>, <i>Id Number</i>, <i>Email</i>, and{" "}
                        <i>Matching Data</i> columns.
                    </p>
                    <ExamTokensTable inDeleteMode={inDeleteMode} />
                </div>
            </div>
        </React.Fragment>
    );
}
