import React from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { ExamToken } from "../../../api/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { EditableCell, EditableType } from "../../../components/editable-cell";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { adminThunks } from "../../../features/admin/thunks";
import { modelDataSelectors } from "../../../features/model-data/model-data";

export function ExamTokensTable({ inDeleteMode = false }) {
    const dispatch = useAppDispatch();

    // The token data needs to be mangled together so all the necessary information is in the table.
    const data = useAppSelector(modelDataSelectors.flatExamTokens);

    const columns = React.useMemo(() => {
        // props.original contains the row data for this particular applicant
        function CellDeleteButton({ row }: { row: { original: ExamToken } }) {
            const examToken = row.original;
            return (
                <div className="delete-button-container">
                    <FaTimes
                        className="delete-row-button"
                        title={`Invalidate ${examToken.token}`}
                        onClick={async () => {
                            await dispatch(
                                adminThunks.examTokens.invalidate(examToken),
                            );
                        }}
                    />
                </div>
            );
        }
        function generateCell(field: string, type: EditableType = "text") {
            return (props: any) => (
                <EditableCell
                    field={field}
                    type={type}
                    upsert={async (examToken: Partial<ExamToken>) => {
                        await dispatch(
                            adminThunks.examTokens.upsert(examToken),
                        );
                    }}
                    {...props}
                />
            );
        }

        return [
            {
                Header: <FaTrash className="delete-row-column-header-icon" />,
                Cell: CellDeleteButton,
                id: "delete_col",
                className: "delete-col",
                show: inDeleteMode,
                maxWidth: 32,
                resizable: false,
            },
            {
                Header: generateHeaderCell("Token"),
                accessor: "token",
            },
            {
                Header: generateHeaderCell("Status"),
                accessor: "status",
            },
            {
                Header: generateHeaderCell("Expiry"),
                accessor: "expiry",
                Cell: generateCell("expiry", "date"),
            },
            {
                Header: generateHeaderCell("Used in Room"),
                accessor: "room_name",
            },
            {
                Header: generateHeaderCell("Used by"),
                accessor: "user_name",
            },
        ];
    }, [dispatch, inDeleteMode]);

    return (
        <AdvancedFilterTable filterable={true} columns={columns} data={data} />
    );
}
