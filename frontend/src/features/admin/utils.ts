import { RootState } from "../../app/store";
import { adminSelectors } from "./exams";

/**
 * Return the `url_token` of the active exam, otherwise throw an error.
 */
export function ensureUrlToken(state: RootState): string {
    const activeExam = adminSelectors.activeExam(state);
    if (!activeExam) {
        throw new Error("Cannot perform action without an `activeExam` set");
    }
    return activeExam.url_token;
}
