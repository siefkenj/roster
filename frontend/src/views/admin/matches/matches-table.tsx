import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { modelDataSelectors } from "../../../features/model-data/model-data";

export function MatchesTable() {
    const data = useAppSelector(modelDataSelectors.flatBookletMatches);

    const columns = React.useMemo(() => {
        const ret: {
            Header: any;
            accessor?: keyof typeof data[number];
        }[] = [
            {
                Header: generateHeaderCell("First Name"),
                accessor: "student_first_name",
            },
            {
                Header: generateHeaderCell("Last Name"),
                accessor: "student_last_name",
            },
            {
                Header: generateHeaderCell("Booklet Number"),
                accessor: "booklet",
            },
            {
                Header: generateHeaderCell("Comments"),
                accessor: "comments",
            },
            {
                Header: generateHeaderCell("Room"),
                accessor: "room_name",
            },
            {
                Header: generateHeaderCell("Matched at"),
                accessor: "time_matched",
            },
            {
                Header: generateHeaderCell("UTORid"),
                accessor: "student_utorid",
            },
            {
                Header: generateHeaderCell("Student Number"),
                accessor: "student_number",
            },
            {
                Header: generateHeaderCell("Extra Data"),
                accessor: "student_matching_data",
            },
            {
                Header: generateHeaderCell("Matched by"),
                accessor: "user_name",
            },
            {
                Header: generateHeaderCell("Matched by (UTORid)"),
                accessor: "user_utorid",
            },
        ];
        return ret;
    }, []);

    return (
        <AdvancedFilterTable filterable={true} columns={columns} data={data} />
    );
}
