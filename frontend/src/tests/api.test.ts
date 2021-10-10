/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect, randomStr } from "./utils";
import fetch from "node-fetch";
import { fetchActiveUser } from "../features/active-user/actions";
import { globalFetchConfig } from "../api/utils";
import { debugApi } from "../features/dev-mode/api-actions";
import { RawExam, RawRoom, RawUser } from "../api/raw-types";
import { fetchRooms, upsertExam, upsertRoom } from "../api/admin-actions";

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
            expect(end_time?.slice(0, 10)).toEqual(
                admin1Exam.end_time?.slice(0, 10)
            );
            Object.assign(admin1Exam, resp);
        });
        it("Add room to exam", async () => {
            const resp = await upsertRoom(admin1Exam.url_token, room1);
            expect(resp).toMatchObject(room1);
            Object.assign(room1, resp);

            const resp2 = await fetchRooms(admin1Exam.url_token);
            expect(resp2.length).toEqual(1);
            expect(resp2).toContainObject(room1);
        });
    });
});
