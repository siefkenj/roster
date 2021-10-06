import React from "react";
import { Button, Nav, Navbar, Tab, Tabs } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AddExamDialog } from "../../components/exams/exam-add-dialog";
import { activeExamSelector } from "../../features/exam/exam-slice";
import { fetchExamTokensThunk } from "../../features/exam_tokens/exam-tokens-slice";
import { modelDataThunks } from "../../features/model-data/model-data";
import { fetchRoomsThunk } from "../../features/rooms/rooms-slice";
import { fetchStudentsThunk } from "../../features/students/student-slice";
import { ExamSelector } from "./exam-selector";
import { ExamTokensView } from "./exam-tokens/exam-tokens-view";
import { MatchesView } from "./matches/matches-view";
import { RoomsView } from "./rooms/rooms-view";
import { RosterView } from "./roster/roster-view";

export function AdminLanding() {
    const [showAddExamDialog, setShowAddExamDialog] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("rooms");
    const dispatch = useAppDispatch();
    const activeExam = useAppSelector(activeExamSelector);

    React.useEffect(() => {
        if (activeExam == null) {
            return;
        }
        (async () => {
            await Promise.all([
                dispatch(fetchExamTokensThunk()),
                dispatch(fetchRoomsThunk()),
                dispatch(modelDataThunks.fetchUsers()),
                dispatch(modelDataThunks.fetchBookletMatches()),
                dispatch(fetchStudentsThunk()),
            ]);
        })();
    }, [dispatch, activeExam]);

    return (
        <div className="admin-view-container">
            <Navbar bg="primary" variant="dark">
                <Navbar.Brand>
                    <i>Admin View</i>
                </Navbar.Brand>
                <Nav className="text-light ml-auto">
                    <ExamSelector />
                    <Button
                        variant="outline-light"
                        className="ml-2"
                        onClick={() => setShowAddExamDialog(true)}
                    >
                        <FaPlus
                            style={{ verticalAlign: "sub" }}
                            className="mr-2"
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
