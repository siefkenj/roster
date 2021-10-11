/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect, randomStr } from "./utils";
import fetch from "node-fetch";
import { fetchActiveUser } from "../features/active-user/actions";
import { globalFetchConfig } from "../api/utils";
import { debugApi } from "../features/dev-mode/api-actions";
import { RawExam, RawRoom, RawStudent, RawUser } from "../api/raw-types";
import {
    deleteRoom,
    deleteStudent,
    fetchExamTokens,
    fetchRooms,
    fetchStudents,
    uploadRoomRoster,
    uploadStudentRoster,
    upsertExam,
    upsertExamToken,
    upsertRoom,
    upsertStudent,
} from "../api/admin-actions";

if (!globalThis.fetch) {
    (globalThis as any).fetch = fetch;
}

globalFetchConfig.baseUrl = "http://backend:3000";

describe("API Tests", () => {
    const debugUser = { name: "Debug User", utorid: "debug-user" } as RawUser;
    const adminUser1 = { name: "Ron Smith", utorid: "admin1" } as RawUser;
    const adminUser2 = { name: "Tammy Wong", utorid: "admin2" } as RawUser;
    describe("Debug tests", () => {
        it("Can setup a new user", async () => {
            const resp = await debugApi.upsertUser(debugUser);
            // The new users should have the fields of `debugUser`. `id` will
            // exist in `resp`, but it will be ignored by Jest, because Jest tests
            // for subsets of attributes only.
            expect(resp).toMatchObject(debugUser);
            // We don't want the `last_seen` attribute saved, since it will always be changing
            const { last_seen, ...rest } = resp;
            Object.assign(debugUser, rest);
        });
        it("Can set active user", async () => {
            const resp = await debugApi.setActiveUser(debugUser);
            expect(resp).toMatchObject(debugUser);
        });
        // Create some users to use in other tests
        it("Can setup users for admin tests", async () => {
            let resp = await debugApi.upsertUser(adminUser1);
            expect(resp).toMatchObject(adminUser1);
            {
                const { last_seen, ...rest } = resp;
                Object.assign(adminUser1, rest);
            }
            resp = await debugApi.upsertUser(adminUser2);
            expect(resp).toMatchObject(adminUser2);
            {
                const { last_seen, ...rest } = resp;
                Object.assign(adminUser2, rest);
            }
        });
    });

    describe("Admin tests", () => {
        const admin1Exam = {
            name: `Important Exam ${randomStr()}`,
            end_time: new Date().toISOString(),
        } as RawExam;
        const room1 = { name: "EX 100" } as RawRoom;
        const admin1Student = {
            first_name: "Sally",
            last_name: "Rey",
            email: "foo@bar.com",
            student_number: "8943299",
            utorid: "reysal",
            matching_data: "extra data",
        } as RawStudent;
        it("Fetch active user", async () => {
            await debugApi.setActiveUser(adminUser1);
            const resp = await fetchActiveUser();
            expect(resp).toMatchObject(adminUser1);
        });
        it("Create an exam", async () => {
            const resp = await upsertExam(admin1Exam);
            const { end_time, name } = resp;
            expect(name).toEqual(admin1Exam.name);
            // Rails formats dates differently than javascript, so we should only compare the day
            // (not time, which has timezone information)
            expect(new Date(end_time || "")).toEqual(
                new Date(admin1Exam.end_time || "")
            );
            Object.assign(admin1Exam, resp);
        });

        // Rooms
        it("Add room to exam", async () => {
            const resp = await upsertRoom(admin1Exam.url_token, room1);
            expect(resp).toMatchObject(room1);
            Object.assign(room1, resp);

            const resp2 = await fetchRooms(admin1Exam.url_token);
            expect(resp2.length).toEqual(1);
            expect(resp2).toContainObject(room1);
        });
        it("Update room", async () => {
            room1.name = "EX 101";
            const resp = await upsertRoom(admin1Exam.url_token, room1);
            expect(resp).toMatchObject(room1);
            Object.assign(room1, resp);

            const resp2 = await fetchRooms(admin1Exam.url_token);
            expect(resp2.length).toEqual(1);
            expect(resp2).toContainObject(room1);
        });
        it("Delete room", async () => {
            const resp = await deleteRoom(admin1Exam.url_token, room1.id);
            expect(resp).toMatchObject(room1);

            const resp2 = await fetchRooms(admin1Exam.url_token);
            expect(resp2.length).toEqual(0);
        });
        it("Upload rooms roster", async () => {
            const rooms = [
                { name: "MY 100" },
                { name: "EX 200" },
                { name: "EX 300" },
            ];
            const resp = await uploadRoomRoster(admin1Exam.url_token, rooms);
            expect(resp).toMatchObject(rooms);

            const resp2 = await fetchRooms(admin1Exam.url_token);
            expect(resp2.length).toEqual(3);
            expect(resp2).toMatchObject(rooms);
            // Keep information about the first room
            Object.assign(room1, rooms[0]);
        });

        // Roster
        it("Add student", async () => {
            const resp = await upsertStudent(
                admin1Exam.url_token,
                admin1Student
            );
            expect(resp).toMatchObject(admin1Student);
            Object.assign(admin1Student, resp);

            const resp2 = await fetchStudents(admin1Exam.url_token);
            expect(resp2.length).toEqual(1);
            expect(resp2[0]).toMatchObject(admin1Student);
        });
        it("Update student", async () => {
            admin1Student.last_name = "Fillmore";
            const resp = await upsertStudent(
                admin1Exam.url_token,
                admin1Student
            );
            expect(resp).toMatchObject(admin1Student);
            Object.assign(admin1Student, resp);
        });
        it("Delete student", async () => {
            const resp = await deleteStudent(
                admin1Exam.url_token,
                admin1Student.id
            );
            expect(resp).toMatchObject(admin1Student);
            const resp2 = await fetchStudents(admin1Exam.url_token);
            expect(resp2.length).toEqual(0);
        });
        it("Upload student roster", async () => {
            let students: Partial<RawStudent>[] = [
                { first_name: "Wanda", utorid: "wanda23" },
                { last_name: "Borne", utorid: "borne7" },
            ];
            const resp = await uploadStudentRoster(
                admin1Exam.url_token,
                students
            );
            expect(resp).toMatchObject(students);
            students = resp;
            const resp2 = await fetchStudents(admin1Exam.url_token);
            expect(resp2.length).toEqual(2);
            // Save a student for later
            Object.assign(admin1Student, students[0]);
        });

        // ExamTokens
        it("Create exam tokens for an exam", async () => {
            const resp = await upsertExamToken(admin1Exam.url_token, {});
            expect(resp).toMatchObject({ status: "unused" });
            expect(resp.token).not.toBeNull();
            const examToken = resp;

            const resp2 = await fetchExamTokens(admin1Exam.url_token);
            expect(resp2).toContainObject(examToken);
        });

        it.todo(
            "Cannot upload multiple students with the same utorid for the same id"
        );

        it.todo("Cannot update room that belongs to the wrong exam");
    });
});
