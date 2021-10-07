import { RawUser } from "../../api/raw-types";
import { apiGET, apiPOST } from "../../api/utils";

export const debugApi = {
    fetchUsers: async () => {
        return (await apiGET(`/debug/users`)) as RawUser[];
    },
    upsertUser: async (newUser: Partial<RawUser>) => {
        return (await apiPOST(`/debug/users`, newUser)) as RawUser;
    },
    setActiveUser: async (user: RawUser) => {
        return (await apiPOST(`/debug/active_user`, user)) as RawUser;
    },
};
