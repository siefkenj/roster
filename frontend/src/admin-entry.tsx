import React from "react";
import { Route, Switch } from "react-router";
import { useAppSelector } from "./app/hooks";
import { ActiveExamWrapper } from "./views/admin/active-exam-wrapper";
import { AdminLanding } from "./views/admin/admin-landing";

import "bootstrap/dist/css/bootstrap.min.css";
import "./admin-entry.css";

function App() {
    const notifications = useAppSelector(
        (state) => state.notifications as any[]
    );
    return (
        <div className="admin-view">
            {/* <Notifications notifications={notifications} /> */}
            <Switch>
                <Route path="/admin">
                    <ActiveExamWrapper baseRoute="/admin">
                        <AdminLanding />
                    </ActiveExamWrapper>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
