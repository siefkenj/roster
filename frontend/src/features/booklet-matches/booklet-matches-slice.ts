import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookletMatch } from "../../api/types";
import { RootState } from "../../app/store";

export interface BookletMatchesState {
    booklet_matches: BookletMatch[];
}
const initialState: BookletMatchesState = {
    booklet_matches: [],
};

// Actions

export const bookletMatchesSlice = createSlice({
    name: "bookletMatches",
    initialState,
    reducers: {
        setBookletMatches: (state, action: PayloadAction<BookletMatch[]>) => {
            state.booklet_matches = action.payload;
        },
        upsertBookletMatch: (state, action: PayloadAction<BookletMatch>) => {
            const bookletMatches = action.payload;
            const matchingBookletMatches = state.booklet_matches.find(
                (s) => s.id === bookletMatches.id
            );
            if (matchingBookletMatches) {
                Object.assign(matchingBookletMatches, bookletMatches);
            } else {
                state.booklet_matches.push(bookletMatches);
            }
        },
        deleteBookletMatches: (state, action: PayloadAction<BookletMatch>) => {
            const bookletMatches = action.payload;
            const matchingBookletMatchesIndex = state.booklet_matches.findIndex(
                (s) => s.id === bookletMatches.id
            );
            if (matchingBookletMatchesIndex === -1) {
                throw new Error(
                    `Cannot find bookletMatches with id "${bookletMatches.id}" to delete`
                );
            }
            state.booklet_matches.splice(matchingBookletMatchesIndex, 1);
        },
        /**
         * Like `deleteBookletMatches`, but won't error if there is no corresponding booklet match.
         */
        removeBookletMatchesForStudentById: (
            state,
            action: PayloadAction<number>
        ) => {
            const studentId = action.payload;
            const matchingBookletMatchesIndex = state.booklet_matches.findIndex(
                (s) => s.student_id === studentId
            );
            if (matchingBookletMatchesIndex) {
                state.booklet_matches.splice(matchingBookletMatchesIndex, 1);
            }
        },
    },
});

// Selectors
export function bookletMatchesSelector(state: RootState) {
    return state.booklet_matches.booklet_matches;
}
