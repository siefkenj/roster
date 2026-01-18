import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
    Button,
    Modal,
    Form,
    Spinner,
    Container,
    Row,
    Col,
} from "react-bootstrap";
import { FaUpload } from "react-icons/fa";

type Callback = (...args: any[]) => any;

const DEFAULT_LABEL = "Select a spreadsheet, CSV, or JSON file.";

/**
 * Convert a string to an array buffer.
 *
 * Code taken from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
 */
function str2ab(str: string) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * A dialog for handling file input. The work of showing validation/content is handled by `dialogContent`.
 * This component handles displaying and parting a file specified by an <input type="file" /> node.
 *
 * @param {*} {
 *     dialogOpen,
 *     onCancel,
 *     onClose,
 *     onConfirm,
 *     dialogContent,
 *     onFileChange,
 * } - `onCancel` means the cancel button was clicked. `onClose` means the `x` was clicked or there was a click outside of the dialog window.
 * @returns
 */
export function ImportDialog({
    dialogOpen,
    onCancel,
    onClose,
    onConfirm,
    dialogContent,
    onFileChange,
    setInProgress: parentSetInProgress,
    label = DEFAULT_LABEL,
}: {
    dialogOpen: boolean;
    onCancel: Callback;
    onClose: Callback;
    onConfirm: Callback;
    dialogContent: React.ReactElement;
    onFileChange: Callback;
    setInProgress: Callback;
    label?: string;
}) {
    const [fileInputLabel, setFileInputLabel] = React.useState(label);
    const [fileArrayBuffer, setFileArrayBuffer] =
        React.useState<ArrayBuffer | null>(null);
    const [fileContents, setFileContents] = React.useState<object | null>(null);
    const [inProgress, _setInProgress] = React.useState(false);

    // When we are processing we want to set a spinner button
    // in the dialog as well as communicate to our parent
    // that we are in the midst of processing. Therefore, we
    // call both the internal `setInProgress` function as well
    // as the one from our parent.
    function setInProgress(val: boolean) {
        _setInProgress(val);
        if (typeof parentSetInProgress === "function") {
            parentSetInProgress(val);
        }
    }

    if (!(onCancel instanceof Function)) {
        onCancel = () => console.warn("No onCancel function set for dialog");
    }

    // When file contents changes
    React.useEffect(() => {
        if (!fileContents) {
            return;
        }
        if (onFileChange instanceof Function) {
            onFileChange(fileContents);
        }
    }, [fileContents, onFileChange]);

    // Wrap the <input type="file" /> in an effect that parses the file
    React.useEffect(() => {
        if (!fileArrayBuffer) {
            return;
        }

        // Attempt to decode the file as JSON. If that doesn't work,
        // we process it as a spreadsheet.

        const rawData = new Uint8Array(fileArrayBuffer);
        try {
            const str = new TextDecoder().decode(rawData);
            setFileContents({ data: JSON.parse(str), fileType: "json" });
            return;
            // eslint-disable-next-line
        } catch (e) {}
        try {
            const workbook = XLSX.read(rawData, { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            setFileContents({
                data: XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]),
                fileType: "spreadsheet",
            });
            return;
            // eslint-disable-next-line
        } catch (e) {}

        console.warn(
            "Could not determine file type for",
            fileInputLabel,
            fileArrayBuffer,
        );
    }, [fileArrayBuffer, fileInputLabel]);

    function _onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        if (!target.files) {
            return;
        }
        const file = target.files[0];
        setFileInputLabel(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            let buffer = e.target?.result;
            if (typeof buffer === "string") {
                buffer = str2ab(buffer);
            }

            setFileArrayBuffer(buffer || null);
        };
        reader.readAsArrayBuffer(file);
    }

    function _onConfirm() {
        if (!(onConfirm instanceof Function)) {
            return;
        }
        setInProgress(true);
        // We wrap `onConfirm` in an async function which will automatically
        // convert it to a promise if needed.
        (async () => onConfirm(fileContents))()
            .then(() => {
                setInProgress(false);
            })
            .catch(console.error)
            .finally(() => {
                setInProgress(false);
                setFileArrayBuffer(null);
                setFileContents(null);
                setFileInputLabel(label);
            });
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;

    return (
        <Modal
            show={dialogOpen}
            onHide={onClose}
            size="lg"
            dialogClassName="wide-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Import From File</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Container>
                    <Row className="mb-3">
                        <Col>
                            <Form>
                                <Form.Group>
                                    <Form.Label>{fileInputLabel}</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={_onFileChange}
                                    />
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col>{dialogContent}</Col>
                    </Row>
                </Container>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={_onConfirm}>
                    {spinner}
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * Renders an dropdown import button component that imports data from file.
 * When clicked, a dialog is opened where a user can select a file to import.
 */
export function ImportButton({
    onFileChange,
    dialogContent,
    onConfirm,
    setInProgress,
    children,
}: React.PropsWithChildren<{
    onFileChange: Callback;
    dialogContent: React.ReactElement;
    onConfirm: Callback;
    setInProgress: Callback;
}>) {
    const [dialogOpen, setDialogOpen] = useState(false);

    /**
     * closes the dialog by setting dialogOpen to false
     */
    function handleClose() {
        setDialogOpen(false);
    }

    function onCancel() {
        onFileChange(null);
        handleClose();
    }

    async function _onConfirm(...args: any[]) {
        await onConfirm(...args);
        setDialogOpen(false);
    }

    return (
        <React.Fragment>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
                <FaUpload className="me-2" />
                {children}
            </Button>
            <ImportDialog
                dialogOpen={dialogOpen}
                onCancel={onCancel}
                onClose={handleClose}
                onFileChange={onFileChange}
                dialogContent={dialogContent}
                onConfirm={_onConfirm}
                setInProgress={setInProgress}
            />
        </React.Fragment>
    );
}
