import React, { Suspense } from "react";
import { useRouteMatch } from "react-router";

const AdminEntry = React.lazy(() => import("./admin-entry"));
const ProctorEntry = React.lazy(() => import("./proctor-entry"));

/**
 * Dynamically load the correct entry component based on the route string.
 */
export default function DynamicEntryRouter() {
    const adminRoute = useRouteMatch("/admin");
    let Content = ProctorEntry;
    if (adminRoute) {
        Content = AdminEntry;
    }
    return (
        <React.Fragment>
            <Suspense fallback="Loading...">
                <Content />
            </Suspense>
        </React.Fragment>
    );
}
