import React from "react";
import { Route, Switch } from "react-router";
import { ActiveExamWrapper } from "./views/admin/active-exam-wrapper";
import { AdminLanding } from "./views/admin/admin-landing";

import "bootstrap/dist/css/bootstrap.min.css";
import "./admin-entry.css";
import { ConnectedNotifications } from "./views/common/notifications";

function App() {
    return (
        <div className="admin-view">
            <ConnectedNotifications />
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
