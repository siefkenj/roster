import React from "react";
import { Dropdown } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { FilterableMenu } from "../../components/filterable-menu";
import { adminSelectors, adminSlice } from "../../features/admin/exams";
import { adminThunks } from "../../features/admin/thunks";
import { modelDataSelectors } from "../../features/model-data/model-data";

export function ExamSelector() {
    const exams = useAppSelector(modelDataSelectors.exams);
    const activeExam = useAppSelector(adminSelectors.activeExam);
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
            await dispatch(adminThunks.exams.fetch());
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
                    dispatch(adminSlice.actions.setActiveExam(sortedExams[+i]));
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
