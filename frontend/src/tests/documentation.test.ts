/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect, apiGET } from "./utils";

import * as TJS from "typescript-json-schema";
import { resolve } from "path";

const BASE_PATH = "/app/src/api/";
const TYPES_FILE = "raw-types.ts";
const COMPLIER_OPTIONS = {
    strictNullChecks: true,
    // Without this, TJS may error due to incorrect @types/... files. We don't care about those.
    // We only care about the consistency of our internal types.
    skipLibCheck: true,
};

describe("Documentation tests", () => {
    it("All attributes from types reported by the backend are included in the typescript types", async () => {
        const resp = await apiGET("/debug/serializers");
        expect(resp).toHaveStatus("success");
        const typesFromBackend = resp.payload as {
            name: string;
            attributes: string[];
        }[];

        // Generate types from the typescript definitions
        const program = TJS.getProgramFromFiles(
            [resolve(BASE_PATH + "/" + TYPES_FILE)],
            COMPLIER_OPTIONS
        );

        const schema = TJS.generateSchema(program, "*");
        const typescriptTypes = schema?.definitions || {};

        for (const type of typesFromBackend) {
            const { name, attributes } = type;
            // We expect there to be a Typescript type corresponding to `name` but prefixed with `Raw`.
            // This type should have the attributes reported by the backend.
            const typescriptName = `Raw${name}`;
            expect(typescriptTypes).toContainTypeDescription({
                name: typescriptName,
                attributes,
            });
        }
    });
});
