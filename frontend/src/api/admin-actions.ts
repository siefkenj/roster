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

// Exams
export async function fetchExams() {
    return (await apiGET("/admin/exams")) as RawExam[];
}

export async function fetchExam(url_token: string) {
    return (await apiGET(`/admin/exams/${url_token}`)) as RawExam;
}

export async function deleteExam(url_token: string) {
    return (await apiPOST(`/admin/exams/${url_token}/delete`)) as RawExam;
}

export async function upsertExam(exam: Partial<RawExam>) {
    return (await apiPOST("/admin/exams", exam)) as RawExam;
}

// Students
export async function fetchStudents(exam_url_token: string) {
    return (await apiGET(
        `/admin/exams/${exam_url_token}/students`
    )) as RawStudent[];
}

export async function fetchStudent(exam_url_token: string, student_id: number) {
    return (await apiGET(
        `/admin/exams/${exam_url_token}/students/${student_id}`
    )) as RawStudent;
}

export async function upsertStudent(
    exam_url_token: string,
    student: Partial<Student>
) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/students`,
        student
    )) as RawStudent;
}

export async function uploadStudentRoster(
    exam_url_token: string,
    students: Student[]
) {
    return (await apiPOST(`/admin/exams/${exam_url_token}/students/roster`, {
        roster: students,
    })) as RawStudent[];
}

export async function deleteStudent(
    exam_url_token: string,
    student_id: number
) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/students/${student_id}/delete`
    )) as RawStudent;
}

// Rooms
export async function fetchRooms(exam_url_token: string) {
    return (await apiGET(`/admin/exams/${exam_url_token}/rooms`)) as RawRoom[];
}

export async function fetchRoom(exam_url_token: string, room_id: number) {
    return (await apiGET(
        `/admin/exams/${exam_url_token}/rooms/${room_id}`
    )) as RawRoom;
}

export async function upsertRoom(exam_url_token: string, room: Partial<Room>) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/rooms`,
        room
    )) as RawRoom;
}

export async function uploadRoomRoster(exam_url_token: string, rooms: Room[]) {
    return (await apiPOST(`/admin/exams/${exam_url_token}/rooms/roster`, {
        roster: rooms,
    })) as RawRoom[];
}

export async function deleteRoom(exam_url_token: string, room_id: number) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/rooms/${room_id}/delete`
    )) as RawRoom;
}

// ExamTokens
export async function fetchExamTokens(exam_url_token: string) {
    return (await apiGET(
        `/admin/exams/${exam_url_token}/exam_tokens`
    )) as RawExamToken[];
}

export async function fetchExamToken(exam_url_token: string, room_id: number) {
    return (await apiGET(
        `/admin/exams/${exam_url_token}/exam_tokens/${room_id}`
    )) as RawExamToken;
}

export async function upsertExamToken(
    exam_url_token: string,
    room: Partial<ExamToken>
) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/exam_tokens`,
        room
    )) as RawExamToken;
}

export async function deleteExamToken(exam_url_token: string, room_id: number) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/exam_tokens/${room_id}/delete`
    )) as RawExamToken;
}

export async function invalidateExamToken(
    exam_url_token: string,
    room_id: number
) {
    return (await apiPOST(
        `/admin/exams/${exam_url_token}/exam_tokens/${room_id}/invalidate`
    )) as RawExamToken;
}

export async function fetchUsers(url_token: string) {
    return (await apiGET(`/admin/exams/${url_token}/users`)) as RawUser[];
}

export async function fetchBookletMatches(exam_url_token: string) {
    return (await apiGET(
        `/admin/exams/${exam_url_token}/booklet_matches`
    )) as RawBookletMatch[];
}
