import React from "react";
import { apiGET } from "../../api/utils";

interface ApiRouteType {
    path: string;
    verb: "GET" | "POST";
    parts: string[];
    controller: string;
    action: string;
    source_location: [string, number];
}

/**
 * Break a route path up by its parts. For example, `/foo/:bar/baz` with parts `["bar"]`
 * will get parsed as
 * `[{type: "raw", value: "/foo"}, {type: "var", value: "bar"}, {type: "raw", value: "/baz"}]`
 */
function split_path_by_parts(
    path: string,
    parts: string[]
): { type: "raw" | "var"; value: string }[] {
    if (parts.length === 0) {
        return [{ type: "raw", value: path }];
    }
    const regex = new RegExp(parts.map((p) => ":" + p).join("|"), "g");

    const rawParts = path.split(regex);
    const varParts = Array.from(path.matchAll(regex));
    const ret: { type: "raw" | "var"; value: string }[] = [];
    for (let i = 0; i < rawParts.length; i++) {
        ret.push({
            type: "raw",
            value: rawParts[i],
        });
        const match = varParts[i] || [""];
        ret.push({
            type: "var",
            // The match will start with a ":", so we need to trim it off
            value: (match[0] || "").slice(1),
        });
    }

    return ret.filter((x) => x.value);
}

function ApiRoute({ route }: { route: ApiRouteType }) {
    // We need to split the URL by its route parameters
    const pathParts = split_path_by_parts(route.path, route.parts);

    return (
        <div
            className="api-route-container"
            title={`controller: ${
                route.controller
            }\nfile: ${route.source_location.map((s) => "" + s).join(":")}`}
        >
            <span className={`verb ${route.verb}`}>{route.verb}</span>
            <span className="path">
                {pathParts.map((part, i) => (
                    <span key={i} className={part.type}>
                        {part.value}
                    </span>
                ))}
            </span>
        </div>
    );
}

export function ApiDocs() {
    const [apiRoutes, setApiRoutes] = React.useState<ApiRouteType[]>([]);

    React.useEffect(() => {
        (async () => {
            const routes = (await apiGET("/debug/routes")) as ApiRouteType[];
            setApiRoutes(routes);
        })();
    }, [setApiRoutes]);

    return (
        <div>
            {apiRoutes.map((route) => (
                <ApiRoute key={`${route.verb}-${route.path}`} route={route} />
            ))}
        </div>
    );
}
