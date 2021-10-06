import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchBookletMatches, fetchUsers } from "../../api/admin-actions";
import { RawBookletMatch, RawUser } from "../../api/raw-types";
import { createAsyncThunkWithErrorNotifications } from "../../app/hooks";
import { RootState } from "../../app/store";
import {
    ensureUrlToken,
    examTokensSelector,
} from "../exam_tokens/exam-tokens-slice";
import { roomsSelector } from "../rooms/rooms-slice";
import { studentsSelector } from "../students/student-slice";

export interface ModelDataState {
    users: RawUser[];
    booklet_matches: RawBookletMatch[];
}
const initialState: ModelDataState = {
    users: [],
    booklet_matches: [],
};

/*
// XXX This is part of an experiment, but there's no time for that now...


// Taken from https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
const toCamel = (s: string) => {
    return s.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
};

// Taken from https://stackoverflow.com/questions/60269936/typescript-convert-generic-object-from-snake-to-camel-case
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

function camelCase<T extends string>(str: T): SnakeToCamelCase<T> {
    return toCamel(str) as SnakeToCamelCase<T>;
}

type OnlyArrayAttrs<Key extends string, J> = {
    [key in Key]: J[]
}

function createBasicReducers<
    Keys,
    T extends OnlyArrayAttrs<Keys, {id: number}>,
>(initialState: T) {
    function setFactory<K extends keyof T>(attr: K) {
        return (state: T, action: PayloadAction<T[K]>) => {
            state[attr] = action.payload;
        };
    }
    function upsertFactory<K extends keyof T>(attr: K) {
        return (state: T, action: PayloadAction<T[K][number]>) => {
            const newObj = action.payload;
            const obj = state[attr].find((e) => e.id === newObj.id);
            if (obj) {
                Object.assign(obj, newObj);
            } else {
                state[attr].push(newObj);
            }
        };
    }
    function deleteFactory<K extends keyof T>(attr: K) {
        return (state: T, action: PayloadAction<T[K][number]>) => {
            const newObj = action.payload;
            const matchingIndex = state[attr].findIndex(
                (s) => s.id === newObj.id
            );
            if (matchingIndex !== -1) {
                state[attr].splice(matchingIndex, 1);
            }
        };
    }
    
    const keys = Object.keys(initialState) as (keyof T)[];
    const ret=  keys.map(k => [camelCase(k as string), k])
    return ret
    //return {
    //    reducers: {},
    //};
}

const y:OnlyArrayAttrs<"users" | "booklet_matches", any> = initialState 

const x = createBasicReducers<"users", typeof initialState>(initialState)
let z = x[0][0]
*/

// Actions
export const modelDataThunks = {
    fetchUsers: createAsyncThunkWithErrorNotifications(
        "users/fetch",
        async (_, { dispatch, getState }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const users = await fetchUsers(url_token);
            return dispatch(modelDataSlice.actions.setUsers(users));
        }
    ),
    fetchBookletMatches: createAsyncThunkWithErrorNotifications(
        "bookletMatches/fetch",
        async (_, { dispatch, getState }) => {
            const url_token = ensureUrlToken(getState() as RootState);
            const bookletMatches = await fetchBookletMatches(url_token);
            return dispatch(
                modelDataSlice.actions.setBookletMatches(bookletMatches)
            );
        }
    ),
};

export const modelDataSlice = createSlice({
    name: "model_data",
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<RawUser[]>) => {
            state.users = action.payload;
        },
        upsertUser: (state, action: PayloadAction<RawUser>) => {
            const newUser = action.payload;
            const user = state.users.find((e) => e.id === newUser.id);
            if (user) {
                Object.assign(user, newUser);
            } else {
                state.users.push(newUser);
            }
        },
        deleteUser: (state, action: PayloadAction<RawUser>) => {
            const user = action.payload;
            const matchingUserIndex = state.users.findIndex(
                (s) => s.id === user.id
            );
            if (matchingUserIndex !== -1) {
                state.users.splice(matchingUserIndex, 1);
            }
        },
        setBookletMatches: (
            state,
            action: PayloadAction<RawBookletMatch[]>
        ) => {
            state.booklet_matches = action.payload;
        },
        upsertBookletMatch: (state, action: PayloadAction<RawBookletMatch>) => {
            const newBookletMatch = action.payload;
            const user = state.booklet_matches.find(
                (e) => e.id === newBookletMatch.id
            );
            if (user) {
                Object.assign(user, newBookletMatch);
            } else {
                state.booklet_matches.push(newBookletMatch);
            }
        },
        deleteBookletMatch: (state, action: PayloadAction<RawBookletMatch>) => {
            const user = action.payload;
            const matchingBookletMatchIndex = state.booklet_matches.findIndex(
                (s) => s.id === user.id
            );
            if (matchingBookletMatchIndex !== -1) {
                state.booklet_matches.splice(matchingBookletMatchIndex, 1);
            }
        },
    },
});

// Selectors
export const modelDataSelectors = {
    users(state: RootState) {
        return state.model_data.users;
    },
    bookletMatches(state: RootState) {
        return state.model_data.booklet_matches;
    },
    /**
     * Compute a "flat" representation of the booklet-matches data that can
     * be displayed in a table or downloaded
     */
    flatBookletMatches(state: RootState) {
        const bookletMatches = modelDataSelectors.bookletMatches(state);
        const rooms = roomsSelector(state);
        const students = studentsSelector(state);
        const users = modelDataSelectors.users(state);

        const studentsHash = new Map(
            students.map((student) => [student.id, student])
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
    /**
     * Compute a "flat" representation of the exam tokens data that can
     * be displayed in a table or downloaded
     */
    flatExamTokens(state: RootState) {
        const examTokens = examTokensSelector(state);
        const rooms = roomsSelector(state);
        const users = modelDataSelectors.users(state);

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
};
