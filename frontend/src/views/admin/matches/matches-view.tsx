import React from "react";
import { Button } from "react-bootstrap";
import { FaDownload, FaSync } from "react-icons/fa";
import { useAppDispatch } from "../../../app/hooks";
import { exportThunks } from "../../../features/admin/export-thunks";
import { modelDataThunks } from "../../../features/model-data/model-data";
import { MatchesTable } from "./matches-table";

export function MatchesView() {
    const dispatch = useAppDispatch();

    return (
        <React.Fragment>
            <div className="admin-tab-view-container">
                <div className="admin-tab-view-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            dispatch(modelDataThunks.fetchBookletMatches());
                        }}
                    >
                        <FaSync className="mr-2" />
                        Re-fetch Matches
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            dispatch(exportThunks.downloadBookletMatches());
                        }}
                    >
                        <FaDownload className="mr-2" />
                        Export Matches
                    </Button>
                </div>
                <div className="admin-tab-view-content">
                    <p>
                        View and export the booklet matches for your exam. If
                        you want to edit a booklet match (either to change or
                        delete it), you must do so in the proctor interface
                        using an exam token.
                    </p>
                    <MatchesTable />
                </div>
            </div>
        </React.Fragment>
    );
}
