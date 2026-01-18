/* eslint-env node */
import { ApiResponse } from "../api/raw-types";
// eslint-disable-next-line
const { expect, test, it, describe, beforeAll } = global as any;

// add a custom `.toContainObject` method to `expect()` to see if an array contains
// an object with matching props. Taken from
// https://medium.com/@andrei.pfeiffer/jest-matching-objects-in-array-50fe2f4d6b98
expect.extend({
    toContainObject(received: object[], argument: object) {
        const pass = this.equals(
            received,
            expect.arrayContaining([expect.objectContaining(argument)]),
        );

        if (pass) {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(
                        received,
                    )} not to contain object ${this.utils.printExpected(
                        argument,
                    )}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(
                        received,
                    )} to contain object ${this.utils.printExpected(argument)}`,
                pass: false,
            };
        }
    },
    toHaveStatus(received: ApiResponse, argument: "success" | "error") {
        if (received == null) {
            throw new Error(
                "Cannot check the status of a null/undefined response",
            );
        }
        if (received.status === argument) {
            return {
                pass: true,
                message: () =>
                    `expected API response to not have ${this.utils.printExpected(
                        {
                            status: argument,
                        },
                    )} but received ${this.utils.printReceived(received)}`,
            };
        } else {
            return {
                pass: false,
                message: () =>
                    `expected API response to have ${this.utils.printExpected({
                        status: argument,
                    })} but received ${this.utils.printReceived(received)}`,
            };
        }
    },
    toHaveKey(received: object, argument: string) {
        if (typeof received !== "object" || received == null) {
            throw new Error("Only objects can have keys");
        }
        if (argument in received) {
            return {
                pass: true,
                message: () =>
                    `expected object response to not have key ${this.utils.printExpected(
                        argument,
                    )} but it does.`,
            };
        } else {
            return {
                pass: false,
                message: () =>
                    `expected object to have key ${this.utils.printExpected(
                        argument,
                    )} but only has keys ${this.utils.printReceived(
                        Object.keys(received),
                    )}`,
            };
        }
    },
    toContainTypeDescription(
        received: object,
        argument: { name: string; attributes: string[] },
    ) {
        // `received` is expected to be an object with keys
        // that are Typescript type names and values containing a `properties`
        // filed which is an object with keys equal to the types properties.
        // e.g.
        // { RawUser: { properties: { id: ..., utorid: ..., roles: ... } } }
        if (typeof received !== "object" || received == null) {
            throw new Error("Invalid typescript definition");
        }
        if (argument.name in received) {
            const properties = Object.keys(
                (received as any)[argument.name].properties || {},
            ).sort();
            const expectedProperties = [...argument.attributes].sort();
            const pass = this.equals(properties, expectedProperties);
            if (pass) {
                return {
                    pass: true,
                    message: () =>
                        `expected ${this.utils.printExpected(
                            argument.name,
                        )} type to not have attributes ${this.utils.printExpected(
                            argument.attributes,
                        )} but it does.`,
                };
            } else {
                return {
                    pass: false,
                    message: () =>
                        `expected ${this.utils.printExpected(
                            argument.name,
                        )} type to have attributes ${this.utils.printExpected(
                            expectedProperties,
                        )} but found attributes ${this.utils.printReceived(
                            properties,
                        )}.\n\n${this.utils.diff(
                            expectedProperties,
                            properties,
                        )}`,
                };
            }
        } else {
            return {
                pass: false,
                message: () =>
                    `expected type definition for ${this.utils.printExpected(
                        argument,
                    )} but only have type definitions for ${this.utils.printReceived(
                        Object.keys(received),
                    )}`,
            };
        }
    },
    toListNoMissingRoutes(received: any[]) {
        if (received.length > 0) {
            return {
                pass: false,
                message: () =>
                    `Expected no missing routes, but found the routes\n\n
                        ${this.utils.diff([], received)}\n\nwere missing.`,
            };
        } else {
            return {
                pass: true,
                message: () => `Expected missing routes, but found all routes`,
            };
        }
    },
});

export { expect, test, it, describe, beforeAll };

/** URL prefix for making API calls from inside a docker image */
export const API_URL = "http://backend:3000/api/v1";
const URL = "http://backend:3000";

// Ensure that `path` starts with a `/`
function _ensurePath(path: string) {
    return path.startsWith("/") ? path : "/" + path;
}

/**
 * Make a GET request to the api route specified by `url`.
 * `url` should *not* be prefixed (e.g., just "/sessions", not "/api/v1/sessions")
 *
 * @export
 * @param {string} url The api un-prefixed url route (e.g. "/sessions")
 * @returns
 */
export async function apiGET(url: string, omitPrefix = false) {
    url = omitPrefix ? URL + _ensurePath(url) : API_URL + _ensurePath(url);
    let resp = null;
    try {
        const r = await fetch(url);
        if (!r.ok) {
            const bodyText = await r.text().catch(() => "");
            throw new Error(
                `Fetch failed: ${r.status} ${r.statusText} ${bodyText}`,
            );
        }
        const data = await r.json();
        resp = { data };
    } catch (e) {
        // Modify the error to display some useful information
        throw new Error(
            `Posting to \`${url}\`\nfailed with error: ${(e as Error).message}`,
        );
    }

    // by this point, we have a valid response, so
    // just return the payload
    return resp.data as ApiResponse;
}

/**
 * Make a POST request to the api route specified by `url`.
 * `url` should *not* be prefixed (e.g., just "/sessions", not "/api/v1/sessions")
 *
 * @export
 * @param {string} url The api un-prefixed url route (e.g. "/sessions")
 * @param {object} body The body of the post request -- `JSON.stringify` will be called on this object.
 * @returns
 */
export async function apiPOST(url: string, body = {}, omitPrefix = false) {
    url = omitPrefix ? URL + _ensurePath(url) : API_URL + _ensurePath(url);
    let resp = null;
    try {
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!r.ok) {
            const bodyText = await r.text().catch(() => "");
            throw new Error(
                `Fetch failed: ${r.status} ${r.statusText} ${bodyText}`,
            );
        }
        const data = await r.json();
        resp = { data };
    } catch (e) {
        // Modify the error to display some useful information
        throw new Error(
            `Posting to \`${url}\` with content\n\t${JSON.stringify(
                body,
            )}\nfailed with error: ${(e as Error).message}`,
        );
    }

    // by this point, we have a valid response, so
    // just return the payload
    return resp.data as ApiResponse;
}

export function randomStr(): string {
    return `${Math.random()}`.slice(3, 7);
}
