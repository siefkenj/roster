import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { compareString } from "../../libs/utils";
import { modelDataSelectors } from "../model-data/model-data";
import XLSX from "xlsx";
import FileSaver from "file-saver";

export function dataToFile(
    data: (string | null)[][],
    filePrefix = "",
    dataFormat = "xlsx"
) {
    const fileName = `${filePrefix}${
        filePrefix ? "_" : ""
    }export_${new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    })}`;

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, "Instructors");

    const bookType = dataFormat === "csv" ? "csv" : "xlsx";

    // We convert the data into a blob and return it so that it can be downloaded
    // by the user's browser
    const file = new File(
        [XLSX.write(workbook, { type: "array", bookType })],
        `${fileName}.${bookType}`,
        {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );
    return file;
}

export const exportThunks = {
    downloadBookletMatches: createAsyncThunkWithErrorNotifications(
        "admin/export/bookletMatches",
        async (_: void, { getState }) => {
            const state = getState() as RootState;
            const data = modelDataSelectors.flatBookletMatches(state);
            data.sort((a, b) =>
                compareString(
                    (a.student_last_name || "") +
                        ", " +
                        (a.student_first_name || ""),
                    (b.student_last_name || "") +
                        ", " +
                        (b.student_first_name || "")
                )
            );

            const spreadsheet = [
                [
                    "First Name",
                    "Last Name",
                    "Booklet Number",
                    "Comment",
                    "Room",
                    "Matched at",
                    "UTORid",
                    "Student Number",
                    "Extra Data",
                    "Matched by",
                    "Matched by (UTORid)",
                ] as (string | null)[],
            ].concat(
                data.map((item) => [
                    item.student_first_name,
                    item.student_last_name,
                    item.booklet,
                    item.comments,
                    item.room_name,
                    item.time_matched,
                    item.student_utorid,
                    item.student_number,
                    item.student_matching_data,
                    item.user_name,
                    item.user_utorid,
                ])
            );

            const file = dataToFile(spreadsheet, "booklet_matches");
            FileSaver.saveAs(file);
        }
    ),
    downloadRooms: createAsyncThunkWithErrorNotifications(
        "admin/export/rooms",
        async (_: void, { getState }) => {
            const state = getState() as RootState;
            const data = [...modelDataSelectors.rooms(state)];
            data.sort((a, b) => compareString(a.name, b.name));

            const spreadsheet = [["Room"] as (string | null)[]].concat(
                data.map((item) => [item.name])
            );

            const file = dataToFile(spreadsheet, "rooms");
            FileSaver.saveAs(file);
        }
    ),
    downloadStudents: createAsyncThunkWithErrorNotifications(
        "admin/export/students",
        async (_: void, { getState }) => {
            const state = getState() as RootState;
            const data = [...modelDataSelectors.students(state)];
            data.sort((a, b) =>
                compareString(
                    (a.last_name || "") + ", " + (a.first_name || ""),
                    (b.last_name || "") + ", " + (b.first_name || "")
                )
            );

            const spreadsheet = [
                [
                    "Last Name",
                    "First Name",
                    "UTORid",
                    "Email",
                    "Student Number",
                    "Matching Data",
                ] as (string | null)[],
            ].concat(
                data.map((item) => [
                    item.last_name,
                    item.first_name,
                    item.utorid,
                    item.email,
                    item.student_number,
                    item.matching_data,
                ])
            );

            const file = dataToFile(spreadsheet, "students");
            FileSaver.saveAs(file);
        }
    ),
    downloadExamTokens: createAsyncThunkWithErrorNotifications(
        "admin/export/examTokens",
        async (_: void, { getState }) => {
            const state = getState() as RootState;
            const data = modelDataSelectors.flatExamTokens(state);
            data.sort((a, b) => compareString(a.expiry || "", b.expiry || ""));

            const spreadsheet = [
                [
                    "Short Token",
                    "Status",
                    "Expiry",
                    "Secure Cookie",
                    "Used in Room",
                    "Used by",
                    "Used by (UTORid)",
                ] as (string | null)[],
            ].concat(
                data.map((item) => [
                    item.token,
                    item.status,
                    item.expiry,
                    item.cookie,
                    item.room_name,
                    item.user_name,
                    item.user_utorid,
                ])
            );

            const file = dataToFile(spreadsheet, "exam_tokens");
            FileSaver.saveAs(file);
        }
    ),
};
