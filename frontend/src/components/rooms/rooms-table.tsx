import React from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { Room } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { adminThunks } from "../../features/admin/thunks";
import { modelDataSelectors } from "../../features/model-data/model-data";
import { EditableCell } from "../editable-cell";
import { AdvancedFilterTable } from "../filter-table/advanced-filter-table";
import { generateHeaderCell } from "../table-utils";

export function RoomsTable({ inDeleteMode = false }) {
    const rooms = useAppSelector(modelDataSelectors.rooms);
    const dispatch = useAppDispatch();

    const columns = React.useMemo(() => {
        // props.original contains the row data for this particular applicant
        function CellDeleteButton({ row }: { row: { original: Room } }) {
            const room = row.original;
            return (
                <div className="delete-button-container">
                    <FaTimes
                        className="delete-row-button"
                        title={`Delete ${room.name}`}
                        onClick={async () => {
                            await dispatch(adminThunks.rooms.delete(room));
                        }}
                    />
                </div>
            );
        }
        function generateCell(field: string) {
            return (props: any) => (
                <EditableCell
                    field={field}
                    upsert={async (room: Partial<Room>) => {
                        await dispatch(adminThunks.rooms.upsert(room));
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
                Header: generateHeaderCell("Room Name"),
                accessor: "name",
                Cell: generateCell("name"),
            },
        ];
    }, [dispatch, inDeleteMode]);

    return (
        <AdvancedFilterTable filterable={true} columns={columns} data={rooms} />
    );
}
