import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    RawBookletMatch,
    RawExam,
    RawExamToken,
    RawRoom,
    RawStudent,
    RawUser,
} from "../../api/raw-types";
import { Exam } from "../../api/types";
import { RootState } from "../../app/store";
import { createBasicReducers } from "../../libs/basic-reducers";
import { useSelector } from "react-redux";

export interface ModelDataState {
    users: RawUser[];
    booklet_matches: RawBookletMatch[];
    students: RawStudent[];
    exam_tokens: RawExamToken[];
    exams: RawExam[];
    rooms: RawRoom[];
}
const initialState: ModelDataState = {
    users: [],
    booklet_matches: [],
    students: [],
    exam_tokens: [],
    exams: [],
    rooms: [],
};

const basicReducers = createBasicReducers(
    initialState,
    {
        users: "user",
        booklet_matches: "booklet_match",
        students: "student",
        exam_tokens: "exam_token",
        rooms: "room",
    } as const,
    "model_data",
);

export const modelDataSlice = createSlice({
    name: "model_data",
    initialState,
    reducers: {
        ...basicReducers.reducers,
        // Since exams don't have `id` attributes, we need to manually make these methods
        upsertExam: (state, action: PayloadAction<Exam>) => {
            const newExam = action.payload;
            const exam = state.exams.find(
                (e) => e.url_token === newExam.url_token,
            );
            if (exam) {
                Object.assign(exam, newExam);
            } else {
                state.exams.push(newExam);
            }
        },
        deleteExam: (state, action: PayloadAction<Exam>) => {
            const exam = action.payload;
            const matchingRoomIndex = state.exams.findIndex(
                (s) => s.url_token === exam.url_token,
            );
            if (matchingRoomIndex !== -1) {
                state.exams.splice(matchingRoomIndex, 1);
            }
        },
        /**
         * Like `deleteBookletMatches`, but won't error if there is no corresponding booklet match.
         */
        removeBookletMatchesForStudentById: (
            state,
            action: PayloadAction<number>,
        ) => {
            const studentId = action.payload;
            const matchingBookletMatchesIndex = state.booklet_matches.findIndex(
                (s) => s.student_id === studentId,
            );
            if (matchingBookletMatchesIndex) {
                state.booklet_matches.splice(matchingBookletMatchesIndex, 1);
            }
        },
    },
});

const flatBookletMatchesSelector = createSelector(
    [
        basicReducers.selectors.bookletMatches,
        basicReducers.selectors.rooms,
        basicReducers.selectors.students,
        basicReducers.selectors.users,
    ],
    (bookletMatches, rooms, students, users) => {
        const studentsHash = new Map(
            students.map((student) => [student.id, student]),
        );
        const roomsHash = new Map(rooms.map((room) => [room.id, room]));
        const usersHash = new Map(users.map((user) => [user.id, user]));
        return bookletMatches.map((bookletMatch) => {
            const room = roomsHash.get(bookletMatch.room_id);
            const user = usersHash.get(bookletMatch.user_id);
            const student = studentsHash.get(bookletMatch.student_id);
            return {
                ...bookletMatch,
                room_name: room?.name ?? null,
                user_utorid: user?.utorid ?? null,
                user_name: user?.name ?? null,
                student_last_name: student?.last_name ?? null,
                student_first_name: student?.first_name ?? null,
                student_utorid: student?.utorid ?? null,
                student_number: student?.student_number ?? null,
                student_email: student?.email ?? null,
                student_matching_data: student?.matching_data ?? null,
            };
        });
    },
);

const flatExamTokensSelector = createSelector(
    [
        basicReducers.selectors.examTokens,
        basicReducers.selectors.rooms,
        basicReducers.selectors.users,
    ],
    (examTokens, rooms, users) => {
        const roomsHash = new Map(rooms.map((room) => [room.id, room]));
        const usersHash = new Map(users.map((user) => [user.id, user]));
        return examTokens.map((examToken) => {
            const room =
                examToken.room_id != null
                    ? roomsHash.get(examToken.room_id)
                    : null;
            const user =
                examToken.user_id != null
                    ? usersHash.get(examToken.user_id)
                    : null;
            return {
                ...examToken,
                room_name: room?.name ?? null,
                user_utorid: user?.utorid ?? null,
                user_name: user?.name ?? null,
                status:
                    examToken.status === "active"
                        ? "Active"
                        : examToken.status === "unused"
                          ? "Not Used"
                          : "Expired",
            };
        });
    },
);

// Selectors
export const modelDataSelectors = {
    ...basicReducers.selectors,
    /**
     * Compute a "flat" representation of the booklet-matches data that can
     * be displayed in a table or downloaded
     */
    flatBookletMatches: flatBookletMatchesSelector,
    /**
     * Compute a "flat" representation of the exam tokens data that can
     * be displayed in a table or downloaded
     */
    flatExamTokens: flatExamTokensSelector,
};
