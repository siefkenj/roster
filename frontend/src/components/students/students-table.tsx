import React from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { Student } from "../../api/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    deleteStudentThunk,
    studentsSelector,
    upsertStudentThunk,
} from "../../features/students/student-slice";
import { EditableCell } from "../editable-cell";
import { AdvancedFilterTable } from "../filter-table/advanced-filter-table";
import { generateHeaderCell } from "../table-utils";

export function StudentsTable({ inDeleteMode = false }) {
    const students = useAppSelector(studentsSelector);
    const dispatch = useAppDispatch();

    const columns = React.useMemo(() => {
        // props.original contains the row data for this particular applicant
        function CellDeleteButton({ row }: { row: { original: Student } }) {
            const student = row.original;
            return (
                <div className="delete-button-container">
                    <FaTimes
                        className="delete-row-button"
                        title={`Delete ${student.last_name}, ${student.first_name}`}
                        onClick={async () => {
                            await dispatch(deleteStudentThunk(student));
                        }}
                    />
                </div>
            );
        }
        function generateCell(field: string) {
            return (props: any) => (
                <EditableCell
                    field={field}
                    upsert={async (student: Partial<Student>) => {
                        await dispatch(upsertStudentThunk(student));
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
                Header: generateHeaderCell("Last Name"),
                accessor: "last_name",
                Cell: generateCell("last_name"),
            },
            {
                Header: generateHeaderCell("First Name"),
                accessor: "first_name",
                Cell: generateCell("first_name"),
            },
            {
                Header: generateHeaderCell("UTORid"),
                accessor: "utorid",
                Cell: generateCell("utorid"),
            },
            {
                Header: generateHeaderCell("Email"),
                accessor: "email",
                Cell: generateCell("email"),
            },
            {
                Header: generateHeaderCell("Student Number"),
                accessor: "student_number",
                Cell: generateCell("student_number"),
            },
            {
                Header: generateHeaderCell("Extra Data"),
                accessor: "matching_data",
                Cell: generateCell("matching_data"),
            },
        ];
    }, [dispatch, inDeleteMode]);

    return (
        <AdvancedFilterTable
            filterable={true}
            columns={columns}
            data={students}
        />
    );
}
