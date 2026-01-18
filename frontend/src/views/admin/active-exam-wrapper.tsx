import React from "react";
import { Redirect, useRouteMatch } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { adminSelectors } from "../../features/admin/exams";
import { adminThunks } from "../../features/admin/thunks";

/**
 * If we have an active exam, we want its url token to be present in the route. If we don't
 * have an active exam, we want to load/set the active exam via any url_token that is present in
 * the route.
 */
export function ActiveExamWrapper({
    children,
    baseRoute,
}: React.PropsWithChildren<{ baseRoute: string }>) {
    const dispatch = useAppDispatch();
    const activeExam = useAppSelector(adminSelectors.activeExam);
    const match = useRouteMatch<{ exam_url_token: string }>(
        `${baseRoute}/exam/:exam_url_token`,
    );
    const matchedUrlToken = match?.params.exam_url_token;
    React.useEffect(() => {
        if (matchedUrlToken && activeExam == null) {
            (async () => {
                await dispatch(
                    adminThunks.exams.fetchAndSetActive(matchedUrlToken),
                );
            })();
        }
    }, [matchedUrlToken, activeExam, dispatch]);

    // If we have an activated exam token, but the cookie is not set in the header,
    // set it in the header
    if (activeExam != null && activeExam.url_token !== matchedUrlToken) {
        return <Redirect to={`${baseRoute}/exam/${activeExam.url_token}`} />;
    }

    // All tests pass
    return <React.Fragment>{children}</React.Fragment>;
}
