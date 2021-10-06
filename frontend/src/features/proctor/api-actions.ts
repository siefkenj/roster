import {
    RawBookletMatch,
    RawExamToken,
    RawRoom,
    RawStudent,
} from "../../api/raw-types";
import { BookletMatch } from "../../api/types";
import { apiGET, apiPOST } from "../../api/utils";

export const proctorApi = {
    fetchExamToken: async (shortToken: string) => {
        return (await apiGET(
            `/proctor/exam_tokens/${shortToken}`
        )) as RawExamToken;
    },
    fetchRooms: async (shortToken: string) => {
        return (await apiGET(
            `/proctor/exam_tokens/${shortToken}/rooms`
        )) as RawRoom[];
    },
    activateExamToken: async (shortToken: string, room_id: number | null) => {
        const body: { room_id?: number } = {};
        if (room_id != null) {
            body.room_id = room_id;
        }
        return (await apiPOST(
            `/proctor/exam_tokens/${shortToken}/activate`,
            body
        )) as RawExamToken;
    },
    fetchExamTokenByCookie: async (cookie: string) => {
        return (await apiGET(
            `/proctor/authenticated/${cookie}/exam_tokens`
        )) as RawExamToken;
    },
    fetchStudents: async (cookie: string) => {
        return (await apiGET(
            `/proctor/authenticated/${cookie}/students`
        )) as RawStudent[];
    },
    fetchBookletMatchForStudent: async (cookie: string, studentId: number) => {
        return (await apiGET(
            `/proctor/authenticated/${cookie}/students/${studentId}/booklet_matches`
        )) as RawBookletMatch | null;
    },
    deleteBookletMatch: async (cookie: string, bookletMatchId: number) => {
        return (await apiPOST(
            `/proctor/authenticated/${cookie}/booklet_matches/${bookletMatchId}/delete`
        )) as RawBookletMatch;
    },
    createBookletMatch: async (
        cookie: string,
        bookletMatch: Partial<BookletMatch>
    ) => {
        return (await apiPOST(
            `/proctor/authenticated/${cookie}/booklet_matches`,
            bookletMatch
        )) as RawBookletMatch;
    },
};
