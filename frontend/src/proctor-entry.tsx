import React from "react";
// import Notifications from "react-notification-system-redux";

import "bootstrap/dist/css/bootstrap.min.css";
import "./proctor-entry.css";

import { TokenSetup } from "./views/proctor/token-setup/token-setup";
import { Redirect, Route, Switch } from "react-router";
import { ActiveExamTokenCatch } from "./views/proctor/token-setup/active-exam-token-catch";
import { ActiveExamTokenWrapper } from "./views/proctor/token-setup/active-exam-token-wrapper";
import { MatchingInterface } from "./views/proctor/matching/matching-interface";
import { ActiveStudentIdWrapper } from "./views/proctor/matching/active-student-id-wrapper";
import { ConnectedNotifications } from "./views/common/notifications";

function App() {
    return (
        <div className="proctor-view">
            <ConnectedNotifications />
            <Switch>
                <Route exact path="/">
                    <Redirect to="/proctor/token-setup" />
                </Route>
                <Route exact path="/proctor/token-setup">
                    <ActiveExamTokenCatch routeUndoTo="/proctor/match">
                        <TokenSetup />
                    </ActiveExamTokenCatch>
                </Route>
                <Route path="/proctor/match">
                    <ActiveExamTokenWrapper baseRoute="/proctor/match">
                        <ActiveStudentIdWrapper baseRoute="/proctor/match">
                            <MatchingInterface />
                        </ActiveStudentIdWrapper>
                    </ActiveExamTokenWrapper>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
