import React from "react";
import { Alert, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { normalizeImport } from "../../libs/import-export/normalize-import";
import { studentSchema } from "../../libs/schema";
import { RawStudent } from "../../api/raw-types";
import { ImportButton } from "../import-button";
import { modelDataSelectors } from "../../features/model-data/model-data";
import { adminThunks } from "../../features/admin/thunks";

export function ImportStudentsButton() {
    const dispatch = useAppDispatch();
    const students = useAppSelector(modelDataSelectors.students);
    const [fileContent, setFileContent] = React.useState<{
        fileType: "json" | "spreadsheet";
        data: any;
    } | null>(null);
    const [processingError, setProcessingError] = React.useState<string | null>(
        null
    );
    const [inProgress, setInProgress] = React.useState(false);
    const [processedData, setProcessedData] = React.useState<
        RawStudent[] | null
    >(null);

    // Recompute the diff every time the file changes
    React.useEffect(() => {
        // If we have no file or we are currently in the middle of processing another file,
        // do nothing.
        if (!fileContent || inProgress) {
            return;
        }
        try {
            setProcessingError(null);
            // normalize the data coming from the file
            const data = normalizeImport(
                fileContent,
                studentSchema
            ) as RawStudent[];

            setProcessedData(data);
        } catch (e) {
            console.warn(e);
            setProcessingError((e as Error).message);
        }
    }, [fileContent, students, inProgress]);

    async function onConfirm() {
        if (!processedData) {
            throw new Error("Unable to find student data");
        }

        await dispatch(adminThunks.students.uploadRoster(processedData));

        setFileContent(null);
    }

    let dialogContent = <p>No data loaded...</p>;
    if (processingError) {
        dialogContent = <Alert variant="danger">{"" + processingError}</Alert>;
    } else if (processedData) {
        if (processedData.length === 0) {
            dialogContent = <Alert variant="warning">No rows found.</Alert>;
        } else {
            const headers = Object.keys(
                processedData[0]
            ) as (keyof RawStudent)[];
            dialogContent = (
                <React.Fragment>
                    <Alert variant="primary">
                        <span className="mb-1">
                            The following{" "}
                            <strong>{processedData.length}</strong> student
                            {processedData.length > 1 ? "s" : ""} will be{" "}
                            <strong>imported</strong>. This student list will
                            override the existing roster.
                        </span>
                        <Table size="sm" striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    {headers.map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.slice(0, 10).map((s) => (
                                    <tr key={s.utorid}>
                                        {headers.map((key) => (
                                            <td key={`${key}-${s.utorid}`}>
                                                {s[key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {processedData.length > 10 && (
                                    <tr style={{ textAlign: "center" }}>
                                        {headers.map((h, i) => (
                                            <td key={i}>…</td>
                                        ))}
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Alert>
                </React.Fragment>
            );
        }
    }

    return (
        <ImportButton
            onConfirm={onConfirm}
            onFileChange={setFileContent}
            dialogContent={dialogContent}
            setInProgress={setInProgress}
        >
            Import Student Roster
        </ImportButton>
    );
}
