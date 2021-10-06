import { RawUser } from "../../api/raw-types";
import { apiGET, apiPOST } from "../../api/utils";

export async function fetchActiveUser() {
    return (await apiGET("/active_user")) as RawUser;
}
export async function upsertActiveUser(user: Partial<RawUser>) {
    return (await apiPOST("/active_user", user)) as RawUser;
}
