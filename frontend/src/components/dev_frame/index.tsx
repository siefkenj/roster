import React from "react";
import PropTypes from "prop-types";
import { NavLink, Switch, Route } from "react-router-dom";

import "./main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button } from "react-bootstrap";

import { ActiveUserButton } from "./active-user-switch";
import { ApiDocs } from "./api-docs";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    debugSelectors,
    debugSlice,
    debugThunks,
    hideDevModeSelector,
} from "../../features/dev-mode/dev-mode-slice";
import { FaTimes } from "react-icons/fa";
import { activeUserSelector } from "../../features/active-user/user-slice";
import { RawUser } from "../../api/raw-types";

/**
 * Wrap `"react-router-dom"`'s `NavLink` in Bootstrap
 * styling.
 *
 * @param {*} props
 * @returns
 */
function BootstrapNavLink(props: React.PropsWithChildren<{ to: string }>) {
    return (
        <Nav.Link
            as={NavLink}
            activeClassName="bg-warning text-dark"
            to={props.to}
        >
            {props.children}
        </Nav.Link>
    );
}
BootstrapNavLink.propTypes = {
    to: PropTypes.string,
};

function ConnectedActiveUserButton() {
    const dispatch = useAppDispatch();
    const activeUser = useAppSelector(activeUserSelector);
    const users = useAppSelector(debugSelectors.users);

    const fetchUsers = React.useCallback(
        async function fetchUsers() {
            return await dispatch(debugThunks.fetchUsers());
        },
        [dispatch],
    );
    const setActiveUser = React.useCallback(
        async function setActiveUser(user?: RawUser | null) {
            if (!user) {
                console.warn("Trying to set `activeUser` to null");
                return;
            }
            return await dispatch(debugThunks.setActiveUser(user));
        },
        [dispatch],
    );

    return (
        <ActiveUserButton
            activeUser={activeUser}
            users={users}
            fetchUsers={fetchUsers}
            setActiveUser={setActiveUser}
        />
    );
}

/*
const ConnectedActiveUserButton = connect(
    (state) => ({
        activeUser: activeUserSelector(state),
        users: usersSelector(state),
    }),
    { fetchUsers: debugOnlyFetchUsers, setActiveUser: debugOnlySetActiveUser }
)(ActiveUserButton);
*/

function ErrorFallback({
    error,
    resetErrorBoundary,
}: {
    error: Error;
    resetErrorBoundary: () => void;
}) {
    return (
        <div role="alert">
            <p>There was an error when rendering. See console for details.</p>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    );
}

function DevFrame({ children }: React.PropsWithChildren<{}>) {
    const hideDevFrame = useAppSelector(hideDevModeSelector);
    const dispatch = useAppDispatch();

    if (hideDevFrame) {
        return <React.Fragment>{children}</React.Fragment>;
    }

    return (
        <div id="dev-frame" className="bg-info">
            <div id="dev-frame-header">
                <Navbar expand variant="dark">
                    <Button
                        size="sm"
                        className="me-2"
                        variant="outline-light"
                        title="Hide the dev frame (this can only be undone by refreshing the browser)"
                        onClick={() => {
                            dispatch(debugSlice.actions.setHideDevFrame(true));
                        }}
                    >
                        <FaTimes />
                    </Button>
                    <Navbar.Brand
                        href="#/admin"
                        title="View Roster in development mode in a framed window."
                    >
                        Admin Mode
                    </Navbar.Brand>
                    <Navbar.Brand
                        href="#/"
                        title="View Roster in development mode in a framed window."
                    >
                        Proctor Mode
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <BootstrapNavLink to="/api-docs">
                            API Docs
                        </BootstrapNavLink>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <ConnectedActiveUserButton />
                    </Navbar.Collapse>
                </Navbar>
            </div>
            <div id="dev-frame-body">
                <div id="dev-frame-body-inner">
                    <Switch>
                        <Route path="/api-docs">
                            <ApiDocs />
                        </Route>
                        <Route>{children}</Route>
                    </Switch>
                </div>
            </div>
            <div id="dev-frame-footer"></div>
        </div>
    );
}

export { DevFrame };
