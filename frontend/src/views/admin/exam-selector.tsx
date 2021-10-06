import React from "react";
import { Dropdown } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { FilterableMenu } from "../../components/filterable-menu";
import {
    activeExamSelector,
    examSlice,
    examsSelector,
    fetchExamsThunk,
} from "../../features/exam/exam-slice";

export function ExamSelector() {
    const exams = useAppSelector(examsSelector);
    const activeExam = useAppSelector(activeExamSelector);
    const dispatch = useAppDispatch();
    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const [sortedExams, displayExams] = React.useMemo(() => {
        const examsCopy = [...exams];
        examsCopy.sort((a, b) =>
            (a.end_time || "").localeCompare(b.end_time || "")
        );
        return [
            examsCopy,
            examsCopy.map((e, i) => ({
                id: i,
                name: `${e.name || ""} (ends ${
                    e.end_time
                        ? new Date(e.end_time).toLocaleDateString("en-CA")
                        : "Undefined"
                })`,
            })),
        ];
    }, [exams]);

    React.useEffect(() => {
        (async () => {
            await dispatch(fetchExamsThunk());
        })();
    }, [dispatch]);

    return (
        <div className="d-flex flex-direction-column align-items-center">
            <div className="mr-2">Selected Exam:</div>
            <Dropdown
                onSelect={(i) => {
                    if (i == null) {
                        return;
                    }
                    dispatch(examSlice.actions.setActiveExam(sortedExams[+i]));
                }}
                onToggle={(desiredVisibility) =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
            >
                <Dropdown.Toggle split variant="light">
                    {activeExam?.name || "No Exam Selected"}{" "}
                </Dropdown.Toggle>
                <FilterableMenu
                    items={displayExams}
                    activeItemId={null}
                    clearFilter={!dropdownVisible}
                />
            </Dropdown>
        </div>
    );
}
