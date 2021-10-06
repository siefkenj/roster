import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    deleteStudent,
    fetchStudents,
    uploadStudentRoster,
    upsertStudent,
} from "../../api/admin-actions";
import { Student } from "../../api/types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import { activeExamSelector } from "../exam/exam-slice";

export interface StudentsState {
    students: Student[];
}
const initialState: StudentsState = {
    students: [],
};

/**
 * Return the `url_token` of the active exam, otherwise throw an error.
 */
function ensureUrlToken(state: RootState): string {
    const activeExam = activeExamSelector(state);
    if (!activeExam) {
        throw new Error("Cannot perform action without an `activeExam` set");
    }
    return activeExam.url_token;
}

// Actions
export const fetchStudentsThunk = createAsyncThunkWithErrorNotifications(
    "students/fetchAll",
    async (_: undefined, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const students = await fetchStudents(url_token);
        return dispatch(studentsSlice.actions.setStudents(students));
    }
);
export const upsertStudentThunk = createAsyncThunkWithErrorNotifications(
    "students/upsert",
    async (student: Partial<Student>, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const newStudent = await upsertStudent(url_token, student);
        return dispatch(studentsSlice.actions.upsertStudent(newStudent));
    }
);
export const deleteStudentThunk = createAsyncThunkWithErrorNotifications(
    "students/delete",
    async (student: Student, { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const deletedStudent = await deleteStudent(url_token, student.id);
        return dispatch(studentsSlice.actions.deleteStudent(deletedStudent));
    }
);
export const uploadStudentRosterThunk = createAsyncThunkWithErrorNotifications(
    "students/uploadRoster",
    async (students: Student[], { getState, dispatch }) => {
        const url_token = ensureUrlToken(getState() as RootState);
        const newStudents = await uploadStudentRoster(url_token, students);
        return dispatch(studentsSlice.actions.setStudents(newStudents));
    }
);

export const studentsSlice = createSlice({
    name: "students",
    initialState,
    reducers: {
        setStudents: (state, action: PayloadAction<Student[]>) => {
            state.students = action.payload;
        },
        upsertStudent: (state, action: PayloadAction<Student>) => {
            const student = action.payload;
            const matchingStudent = state.students.find(
                (s) => s.id === student.id
            );
            if (matchingStudent) {
                Object.assign(matchingStudent, student);
            } else {
                state.students.push(student);
            }
        },
        deleteStudent: (state, action: PayloadAction<Student>) => {
            const student = action.payload;
            const matchingStudentIndex = state.students.findIndex(
                (s) => s.id === student.id
            );
            if (matchingStudentIndex === -1) {
                throw new Error(
                    `Cannot find student with id "${student.id}" to delete`
                );
            }
            state.students.splice(matchingStudentIndex, 1);
        },
    },
});

// Selectors
export function studentsSelector(state: RootState) {
    return state.students.students;
}
