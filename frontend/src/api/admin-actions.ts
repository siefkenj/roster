import {
    RawBookletMatch,
    RawExam,
    RawExamToken,
    RawRoom,
    RawStudent,
    RawUser,
} from "./raw-types";
import { ExamToken, Room, Student } from "./types";
import { apiGET, apiPOST } from "./utils";

export const api = {
    exams: {
        async fetch() {
            return (await apiGET("/admin/exams")) as RawExam[];
        },

        async fetchOne(url_token: string) {
            return (await apiGET(`/admin/exams/${url_token}`)) as RawExam;
        },

        async delete(url_token: string) {
            return (await apiPOST(
                `/admin/exams/${url_token}/delete`,
            )) as RawExam;
        },

        async upsert(exam: Partial<RawExam>) {
            return (await apiPOST("/admin/exams", exam)) as RawExam;
        },
    },
    students: {
        async fetch(exam_url_token: string) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/students`,
            )) as RawStudent[];
        },
        async fetchOne(exam_url_token: string, student_id: number) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/students/${student_id}`,
            )) as RawStudent;
        },
        async upsert(exam_url_token: string, student: Partial<Student>) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/students`,
                student,
            )) as RawStudent;
        },
        async uploadRoster(
            exam_url_token: string,
            students: Partial<Student>[],
        ) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/students/roster`,
                {
                    roster: students,
                },
            )) as RawStudent[];
        },
        async delete(exam_url_token: string, student_id: number) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/students/${student_id}/delete`,
            )) as RawStudent;
        },
    },
    rooms: {
        async fetch(exam_url_token: string) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/rooms`,
            )) as RawRoom[];
        },
        async fetchOne(exam_url_token: string, room_id: number) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/rooms/${room_id}`,
            )) as RawRoom;
        },
        async upsert(exam_url_token: string, room: Partial<Room>) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/rooms`,
                room,
            )) as RawRoom;
        },
        async uploadRoster(
            exam_url_token: string,
            rooms: Omit<RawRoom, "id">[],
        ) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/rooms/roster`,
                {
                    roster: rooms,
                },
            )) as RawRoom[];
        },
        async delete(exam_url_token: string, room_id: number) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/rooms/${room_id}/delete`,
            )) as RawRoom;
        },
    },
    examTokens: {
        async fetch(exam_url_token: string) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/exam_tokens`,
            )) as RawExamToken[];
        },
        async fetchOne(exam_url_token: string, room_id: number) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/exam_tokens/${room_id}`,
            )) as RawExamToken;
        },
        async upsert(exam_url_token: string, exam_token: Partial<ExamToken>) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/exam_tokens`,
                exam_token,
            )) as RawExamToken;
        },
        async delete(exam_url_token: string, room_id: number) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/exam_tokens/${room_id}/delete`,
            )) as RawExamToken;
        },
        async invalidate(exam_url_token: string, room_id: number) {
            return (await apiPOST(
                `/admin/exams/${exam_url_token}/exam_tokens/${room_id}/invalidate`,
            )) as RawExamToken;
        },
    },
    users: {
        async fetch(url_token: string) {
            return (await apiGET(
                `/admin/exams/${url_token}/users`,
            )) as RawUser[];
        },
    },
    bookletMatches: {
        async fetch(exam_url_token: string) {
            return (await apiGET(
                `/admin/exams/${exam_url_token}/booklet_matches`,
            )) as RawBookletMatch[];
        },
    },
};
