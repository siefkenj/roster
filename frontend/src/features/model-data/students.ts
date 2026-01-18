import { api } from "../../api/admin-actions";
import { Student } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { ensureUrlToken } from "../admin/utils";
import { modelDataSlice } from "./model-data";

export const adminStudentThunks = {
    fetch: createAsyncThunkWithErrorNotifications(
        "students/fetchAll",
        async (_: undefined, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const students = await api.students.fetch(url_token);
            return dispatch(modelDataSlice.actions.setStudents(students));
        },
    ),
    upsert: createAsyncThunkWithErrorNotifications(
        "students/upsert",
        async (student: Partial<Student>, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const newStudent = await api.students.upsert(url_token, student);
            return dispatch(modelDataSlice.actions.upsertStudent(newStudent));
        },
    ),
    delete: createAsyncThunkWithErrorNotifications(
        "students/delete",
        async (student: Student, { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const deletedStudent = await api.students.delete(
                url_token,
                student.id,
            );
            return dispatch(
                modelDataSlice.actions.deleteStudent(deletedStudent),
            );
        },
    ),
    uploadRoster: createAsyncThunkWithErrorNotifications(
        "students/uploadRoster",
        async (students: Student[], { getState, dispatch }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const newStudents = await api.students.uploadRoster(
                url_token,
                students,
            );
            return dispatch(modelDataSlice.actions.setStudents(newStudents));
        },
    ),
};
