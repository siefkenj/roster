import React from "react";
import { Button, Nav, Navbar, Tab, Tabs } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AddExamDialog } from "../../components/exams/exam-add-dialog";
import { adminSelectors } from "../../features/admin/exams";
import { adminThunks } from "../../features/admin/thunks";
import { ExamSelector } from "./exam-selector";
import { ExamTokensView } from "./exam-tokens/exam-tokens-view";
import { MatchesView } from "./matches/matches-view";
import { RoomsView } from "./rooms/rooms-view";
import { RosterView } from "./roster/roster-view";

export function AdminLanding() {
    const [showAddExamDialog, setShowAddExamDialog] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("rooms");
    const dispatch = useAppDispatch();
    const activeExam = useAppSelector(adminSelectors.activeExam);

    React.useEffect(() => {
        if (activeExam == null) {
            return;
        }
        (async () => {
            await Promise.all([
                dispatch(adminThunks.examTokens.fetch()),
                dispatch(adminThunks.rooms.fetch()),
                dispatch(adminThunks.users.fetch()),
                dispatch(adminThunks.bookletMatches.fetch()),
                dispatch(adminThunks.students.fetch()),
            ]);
        })();
    }, [dispatch, activeExam]);

    return (
        <div className="admin-view-container">
            <Navbar bg="primary" variant="dark">
                <Navbar.Brand>
                    <i>Admin View</i>
                </Navbar.Brand>
                <Nav className="text-light ms-auto">
                    <ExamSelector />
                    <Button
                        variant="outline-light"
                        className="ms-2"
                        onClick={() => setShowAddExamDialog(true)}
                    >
                        <FaPlus
                            style={{ verticalAlign: "sub" }}
                            className="me-2"
                        />
                        New Exam
                    </Button>
                </Nav>
            </Navbar>
            <AddExamDialog
                show={showAddExamDialog}
                onHide={() => setShowAddExamDialog(false)}
            />
            <Tabs
                id="admin-view-tabs"
                className="mx-2 mt-2"
                transition={false}
                activeKey={activeTab}
                onSelect={(k) => {
                    if (k != null) {
                        setActiveTab(k);
                    }
                }}
            >
                <Tab eventKey="rooms" title="Rooms">
                    <RoomsView />
                </Tab>
                <Tab eventKey="roster" title="Roster">
                    <RosterView />
                </Tab>
                <Tab eventKey="exam-tokens" title="Exam Tokens">
                    <ExamTokensView />
                </Tab>
                <Tab eventKey="matches" title="Matches">
                    <MatchesView />
                </Tab>
            </Tabs>
        </div>
    );
}
