import { adminBookletMatchThunks } from "../model-data/booklet-matches";
import { adminExamTokensThunks } from "../model-data/exam-tokens";
import { adminStudentThunks } from "../model-data/students";
import { adminUserThunks } from "../model-data/users";
import { adminExamThunks } from "./exams";
import { adminRoomsThunks } from "./rooms";

export const adminThunks = {
    students: adminStudentThunks,
    users: adminUserThunks,
    bookletMatches: adminBookletMatchThunks,
    examTokens: adminExamTokensThunks,
    exams: adminExamThunks,
    rooms: adminRoomsThunks,
};
