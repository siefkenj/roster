import React from "react";
import { Alert, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { normalizeImport } from "../../libs/import-export/normalize-import";
import { studentSchema } from "../../libs/schema";
import { RawStudent } from "../../api/raw-types";
import { ImportButton } from "../import-button";
import { modelDataSelectors } from "../../features/model-data/model-data";
import { adminThunks } from "../../features/admin/thunks";
import { FaLightbulb } from "react-icons/fa";

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

    let dialogContent = (
        <React.Fragment>
            <p>No data loaded...</p>
            <Alert variant="info">
                <p>
                    <FaLightbulb className="me-2" />
                    Student information should be provided in a spreadsheet with
                    the following headers:
                    <b>First Name</b>, <b>Last Name</b>, <b>UTORid</b>,{" "}
                    <b>Student Number</b>, <b>Email</b>, and{" "}
                    <b>Matching Data</b>. The <b>UTORid</b> column is required.
                    All other columns are optional.
                </p>
                <p>For example:</p>
                <table className="spreadsheet-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>UTORid</th>
                            <th>Student Number</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tom</td>
                            <td>Smith</td>
                            <td>smitht</td>
                            <td>123412312</td>
                            <td>smith.t@email.com</td>
                        </tr>
                        <tr>
                            <td>Amy</td>
                            <td>Malar</td>
                            <td>marala</td>
                            <td>233412312</td>
                            <td>maral.a@google.com</td>
                        </tr>
                    </tbody>
                </table>
                <p>
                    If the first/last names are not split, you can enter the
                    full name in the <b>Last Name</b> column and leave the{" "}
                    <b>First Name</b> column blank.
                </p>
            </Alert>
        </React.Fragment>
    );
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
