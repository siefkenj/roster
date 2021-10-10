export interface RawUser {
    id: number;
    utorid: string | null;
    name: string | null;
    last_seen: string | null;
}
export interface RawExam {
    url_token: string;
    name: string;
    end_time: string | null;
}
export interface RawRoom {
    id: number;
    name: string;
}
export interface RawStudent {
    id: number;
    email: string | null;
    utorid: string;
    first_name: string | null;
    last_name: string | null;
    matching_data: string | null;
    student_number: string | null;
}
export interface RawBookletMatch {
    id: number;
    booklet: string;
    comments: string | null;
    room_id: number;
    student_id: number;
    time_matched: string;
    user_id: number;
}

export interface RawExamToken {
    id: number;
    cookie: string | null;
    room_id: number | null;
    expiry: string | null;
    token: string;
    user_id: number | null;
    status: "expired" | "active" | "unused";
}

export interface ApiResponse {
    status: "success" | "error";
    message: string;
    payload: unknown;
}
