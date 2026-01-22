import React from "react";
import { Button, ButtonGroup, Dropdown, ToggleButton } from "react-bootstrap";
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
                            dispatch(adminThunks.users.fetch());
                        }}
                    >
                        <FaSync className="me-2" />
                        Re-fetch Tokens
                    </Button>
                    <Dropdown as={ButtonGroup}>
                        <Button
                            onClick={() => {
                                dispatch(adminThunks.examTokens.upsert({}));
                            }}
                            size="sm"
                            title="Create a New Exam Token. Each TA can only use one token; after it is used, it cannot be used again."
                        >
                            <FaPlus className="me-2" />
                            New Token
                        </Button>
                        <Dropdown.Toggle
                            split
                            className="action-button-dropdown"
                        />

                        <Dropdown.Menu>
                            <Dropdown.Item
                                as={Button}
                                title="Create 10 New Exam Tokens"
                                onClick={() => {
                                    for (let i = 0; i < 10; i++) {
                                        dispatch(
                                            adminThunks.examTokens.upsert({}),
                                        );
                                    }
                                }}
                            >
                                <FaPlus className="me-2" />
                                10 Tokens
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Button}
                                title="Create 30 New Exam Tokens"
                                onClick={() => {
                                    for (let i = 0; i < 30; i++) {
                                        dispatch(
                                            adminThunks.examTokens.upsert({}),
                                        );
                                    }
                                }}
                            >
                                <FaPlus className="me-2" />
                                30 Tokens
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <ButtonGroup size="sm">
                        <ToggleButton
                            id="expire-token-toggle"
                            value="1"
                            type="checkbox"
                            checked={inDeleteMode}
                            onChange={(e) =>
                                setInDeleteMode(e.currentTarget.checked)
                            }
                            title="Tokens cannot be deleted, but they can be expired. Expired tokens cannot be used."
                        >
                            <FaHourglassEnd className="me-2" />
                            Expire Token
                        </ToggleButton>
                    </ButtonGroup>
                    <Button
                        size="sm"
                        onClick={() => {
                            dispatch(exportThunks.downloadExamTokens());
                        }}
                        title="Download a spreadsheet with all the exam tokens"
                    >
                        <FaDownload className="me-2" />
                        Export Tokens
                    </Button>
                </div>
                <div className="admin-tab-view-content">
                    <p>
                        Set up the students for your exam. You may upload a
                        spreadsheet with <i>First Name</i>, <i>Last Name</i>,{" "}
                        <i>UTORid</i>, <i>Student Number</i>, <i>Email</i>, and{" "}
                        <i>Matching Data</i> columns.
                    </p>
                    <ExamTokensTable inDeleteMode={inDeleteMode} />
                </div>
            </div>
        </React.Fragment>
    );
}
