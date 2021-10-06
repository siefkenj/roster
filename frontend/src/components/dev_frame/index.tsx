import React from "react";
import PropTypes from "prop-types";
import { NavLink, Switch, Route } from "react-router-dom";

import "./main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav } from "react-bootstrap";

import "swagger-ui-react/swagger-ui.css";
import { ActiveUserButton } from "./active-user-switch";
import { ErrorBoundary } from "react-error-boundary";
import { ApiDocs } from "./api-docs";

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
    return <ActiveUserButton />;
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
    return (
        <div id="dev-frame" className="bg-info">
            <div id="dev-frame-header">
                <Navbar expand variant="dark">
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
                    <Nav className="mr-auto">
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
                        <Route>
                            <ErrorBoundary
                                FallbackComponent={ErrorFallback}
                                onError={console.error}
                            >
                                {children}
                            </ErrorBoundary>
                        </Route>
                    </Switch>
                </div>
            </div>
            <div id="dev-frame-footer"></div>
        </div>
    );
}

export { DevFrame };
