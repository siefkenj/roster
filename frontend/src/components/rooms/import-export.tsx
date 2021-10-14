import React from "react";
import { Alert, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { normalizeImport } from "../../libs/import-export/normalize-import";
import { roomSchema } from "../../libs/schema";
import { RawRoom } from "../../api/raw-types";
import { ImportButton } from "../import-button";
import { modelDataSelectors } from "../../features/model-data/model-data";
import { adminThunks } from "../../features/admin/thunks";
import { FaLightbulb } from "react-icons/fa";

export function ImportRoomsButton() {
    const dispatch = useAppDispatch();
    const rooms = useAppSelector(modelDataSelectors.rooms);
    const [fileContent, setFileContent] = React.useState<{
        fileType: "json" | "spreadsheet";
        data: any;
    } | null>(null);
    const [processingError, setProcessingError] = React.useState<string | null>(
        null
    );
    const [inProgress, setInProgress] = React.useState(false);
    const [processedData, setProcessedData] = React.useState<RawRoom[] | null>(
        null
    );

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
            const data = normalizeImport(fileContent, roomSchema) as RawRoom[];

            setProcessedData(data);
        } catch (e) {
            console.warn(e);
            setProcessingError((e as Error).message);
        }
    }, [fileContent, rooms, inProgress]);

    async function onConfirm() {
        if (!processedData) {
            throw new Error("Unable to find room data");
        }

        await dispatch(adminThunks.rooms.uploadRoster(processedData));

        setFileContent(null);
    }

    let dialogContent = (
        <React.Fragment>
            <p>No data loaded...</p>
            <Alert variant="info">
                <p>
                    <FaLightbulb className="mr-2" />
                    Rooms should be in a single column with a header of{" "}
                    <b>Name</b>.
                </p>
                <p>For example:</p>
                <table className="spreadsheet-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>AB 101</td>
                        </tr>
                        <tr>
                            <td>AB 231</td>
                        </tr>
                        <tr>
                            <td>MX 604</td>
                        </tr>
                    </tbody>
                </table>
            </Alert>
        </React.Fragment>
    );
    if (processingError) {
        dialogContent = <Alert variant="danger">{"" + processingError}</Alert>;
    } else if (processedData) {
        if (processedData.length === 0) {
            dialogContent = <Alert variant="warning">No rows found.</Alert>;
        } else {
            const headers = Object.keys(processedData[0]) as (keyof RawRoom)[];
            dialogContent = (
                <React.Fragment>
                    <Alert variant="primary">
                        <span className="mb-1">
                            The following{" "}
                            <strong>{processedData.length}</strong> room
                            {processedData.length > 1 ? "s" : ""} will be{" "}
                            <strong>imported</strong>. This room list will
                            override the existing one.
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
                                    <tr key={s.name}>
                                        {headers.map((key) => (
                                            <td key={`${key}-${s.name}`}>
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
            Import Room List
        </ImportButton>
    );
}
